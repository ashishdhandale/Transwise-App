
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { FileText, Save, Printer, Download, Loader2, Eye, X, ChevronsUpDown, PlusCircle, Trash2, Pencil } from 'lucide-react';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City, Branch, Vendor, Customer } from '@/lib/types';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDrivers } from '@/lib/driver-data';
import { getVehicles } from '@/lib/vehicle-data';
import { getCities } from '@/lib/city-data';
import { getBranches } from '@/lib/branch-data';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DispatchChallan } from './dispatch-challan';
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getVehicleHireReceipts } from '@/lib/vehicle-hire-data';
import { ClientOnly } from '@/components/ui/client-only';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addVoucher } from '@/lib/accounts-data';
import { BookingForm } from '../bookings/booking-form';
import { LoadingSlip } from './loading-slip';
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
import { getVendors } from '@/lib/vendor-data';
import { getCustomers, saveCustomers } from '@/lib/customer-data';
import { AddCustomerDialog } from '../master/add-customer-dialog';


const generatePermanentChallanId = (challans: Challan[], prefix: string): string => {
    const relevantChallanIds = challans
        .map(c => c.challanId)
        .filter(id => id.startsWith(prefix) && !id.startsWith('TEMP-'));

    if (relevantChallanIds.length === 0) {
        return `${prefix}01`;
    }

    const lastSequence = relevantChallanIds
        .map(id => parseInt(id.substring(prefix.length), 10))
        .filter(num => !isNaN(num))
        .reduce((max, current) => Math.max(max, current), 0);
        
    const newSequence = lastSequence + 1;
    
    return `${prefix}${String(newSequence).padStart(2, '0')}`;
};

export function NewChallanForm() {
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    const [addedSelection, setAddedSelection] = useState<Set<string>>(new Set());
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    
    // Form fields
    const [challanId, setChallanId] = useState('');
    const [dispatchDate, setDispatchDate] = useState<Date | undefined>(undefined);
    const [vehicleNo, setVehicleNo] = useState<string | undefined>(undefined);
    const [driverName, setDriverName] = useState<string | undefined>(undefined);
    const [driverMobile, setDriverMobile] = useState<string>('');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [vehicleOwner, setVehicleOwner] = useState<string | undefined>();
    const [billTo, setBillTo] = useState<string | undefined>();
    const [remark, setRemark] = useState('');
    const [hireReceiptNo, setHireReceiptNo] = useState('');
    const [vehicleHireFreight, setVehicleHireFreight] = useState(0);
    const [advance, setAdvance] = useState(0);
    const [balance, setBalance] = useState(0);
    const [commission, setCommission] = useState(0);
    const [labour, setLabour] = useState(0);
    const [crossing, setCrossing] = useState(0);
    const [carting, setCarting] = useState(0);
    const [debitCreditAmount, setDebitCreditAmount] = useState(0);
    const [isFinalized, setIsFinalized] = useState(false);
    const [fuel, setFuel] = useState(0);
    
    const [lrSearchTerm, setLrSearchTerm] = useState('');
    const [ewbSearchTerm, setEwbSearchTerm] = useState('');
    const [citySearchTerm, setCitySearchTerm] = useState<string | undefined>();
    const [searchResults, setSearchResults] = useState<Booking[]>([]);
    const [searchSelection, setSearchSelection] = useState<Set<string>>(new Set());

    // Master data
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    // Dialog state
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [bookingDataToEdit, setBookingDataToEdit] = useState<Booking | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);

    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = !!searchParams.get('challanId');
    
    const lrNumberInputRef = useRef<HTMLInputElement>(null);

    // PDF Preview state
    const printRef = React.useRef<HTMLDivElement>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ challan: Challan, bookings: Booking[] } | null>(null);
    const [previewType, setPreviewType] = useState<'loading' | 'dispatch'>('loading');
    const [isDownloading, setIsDownloading] = useState(false);
    
    useEffect(() => {
        setBalance((vehicleHireFreight || 0) - (advance || 0) - (fuel || 0));
    }, [vehicleHireFreight, advance, fuel]);

    const totalTopayAmount = useMemo(() => {
        return addedLrs.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0);
    }, [addedLrs]);
    
    const totalFreight = useMemo(() => {
        return addedLrs.reduce((sum, b) => sum + b.totalAmount, 0);
    }, [addedLrs]);

    const totalAddedQty = useMemo(() => addedLrs.reduce((sum, b) => sum + b.qty, 0), [addedLrs]);
    const totalAddedChgWt = useMemo(() => addedLrs.reduce((sum, b) => sum + b.chgWt, 0), [addedLrs]);

    useEffect(() => {
        const calculatedDebitCredit = (totalTopayAmount || 0) - ((commission || 0) + (labour || 0) + (crossing || 0) + (carting || 0) + (balance || 0));
        setDebitCreditAmount(calculatedDebitCredit);
    }, [totalTopayAmount, commission, labour, crossing, carting, balance]);

    const handleDriverSelect = (driverName: string) => {
        setDriverName(driverName);
        const driver = drivers.find(d => d.name === driverName);
        setDriverMobile(driver?.mobile || '');
    };

    const loadInitialData = useCallback(async () => {
        const profile = await getCompanyProfile();
        setCompanyProfile(profile);
        setCustomers(getCustomers());

        const currentBookings = getBookings();
        setAllBookings(currentBookings);
        const allChallans = getChallanData();
        const allCities = getCities();
        const allDrivers = getDrivers();
        
        setVehicles(getVehicles());
        setDrivers(allDrivers);
        setCities(allCities);
        setBranches(getBranches());
        setVendors(getVendors());
        
        const existingChallanId = searchParams.get('challanId');

        if (existingChallanId) {
            setIsHeaderOpen(false); // Collapse header in edit mode
            const existingChallan = allChallans.find(c => c.challanId === existingChallanId);
            const lrDetails = getLrDetailsData().filter(lr => lr.challanId === existingChallanId);
            const addedBookingNos = new Set(lrDetails.map(lr => lr.lrNo));
            
            if (existingChallan?.status === 'Finalized') {
                setIsFinalized(true);
            }

            if (existingChallan) {
                setChallanId(existingChallan.challanId);
                setDispatchDate(new Date(existingChallan.dispatchDate));
                setVehicleNo(existingChallan.vehicleNo);
                setDriverName(existingChallan.driverName);
                const driver = allDrivers.find(d => d.name === existingChallan.driverName);
                setDriverMobile(driver?.mobile || '');
                setFromStation(allCities.find(c => c.name === existingChallan.fromStation) || null);
                setToStation(allCities.find(c => c.name === existingChallan.toStation) || null);
                setVehicleOwner(existingChallan.lorrySupplier);
                setBillTo(existingChallan.dispatchToParty);
                setRemark(existingChallan.remark || '');
                setHireReceiptNo(existingChallan.hireReceiptNo || '');
                setVehicleHireFreight(existingChallan.vehicleHireFreight || 0);
                setAdvance(existingChallan.advance || 0);
                setBalance(existingChallan.balance || 0);
                setCommission(existingChallan.summary.commission || 0);
                setLabour(existingChallan.summary.labour || 0);
                setCrossing(existingChallan.summary.crossing || 0);
                setCarting(existingChallan.summary.carting || 0);
                setDebitCreditAmount(existingChallan.summary.debitCreditAmount || 0);
                setFuel(existingChallan.summary.fuel || 0);

                const added = currentBookings.filter(b => addedBookingNos.has(b.lrNo));
                setAddedLrs(added);
            }
        } else {
            setAddedLrs([]);
            if(profile.city) {
                const defaultStation = allCities.find((c: City) => c.name.toLowerCase() === profile.city.toLowerCase()) || null;
                setFromStation(defaultStation);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);


    useEffect(() => {
        const existingChallanId = searchParams.get('challanId');
        if (!existingChallanId) {
             setChallanId(`TEMP-CHLN-${Date.now()}`);
        }
        setDispatchDate(new Date());
    }, [searchParams]);

    const handleLoadFromHireReceipt = (receiptNo: string) => {
        const currentChallanId = searchParams.get('challanId') || challanId;
        setHireReceiptNo(receiptNo);
        
        if (!receiptNo) {
            // Clear fields if input is empty
            setVehicleNo('');
            setDriverName('');
            setDriverMobile('');
            setFromStation(null);
            setToStation(null);
            setVehicleHireFreight(0);
            setAdvance(0);
            setFuel(0);
            setBalance(0);
            setVehicleOwner(undefined);
            return;
        }

        const allChallans = getChallanData();
        const usedChallan = allChallans.find(c => c.hireReceiptNo === receiptNo && c.challanId !== currentChallanId);
        
        if (usedChallan) {
            toast({
                title: 'Hire Receipt Already Used',
                description: `This hire receipt number is already used in challan ${usedChallan.challanId}.`,
                variant: 'destructive',
            });
            setHireReceiptNo('');
            return;
        }

        const allHireReceipts = getVehicleHireReceipts();
        const receipt = allHireReceipts.find(r => r.receiptNo.toLowerCase() === receiptNo.toLowerCase());
        
        if (receipt) {
            setVehicleNo(receipt.vehicleNo);
            setDriverName(receipt.driverName);
            setDriverMobile(receipt.driverMobile || '');
            setFromStation(cities.find(c => c.name.toLowerCase() === receipt.fromStation.toLowerCase()) || null);
            setToStation(cities.find(c => c.name.toLowerCase() === receipt.toStation.toLowerCase()) || null);
            setVehicleHireFreight(receipt.freight);
            setAdvance(receipt.advance);
            setFuel(receipt.fuel || 0);
            setBalance(receipt.balance);
            setVehicleOwner(receipt.supplierName);
            toast({ title: 'Details Loaded', description: `Details from hire receipt ${receipt.receiptNo} have been loaded.` });
        } else {
            // If not found, clear the details
            setVehicleNo('');
            setDriverName('');
            setDriverMobile('');
            setVehicleHireFreight(0);
            setAdvance(0);
            setFuel(0);
            setBalance(0);
            setVehicleOwner(undefined);
        }
    };
    
    const handleSearchLrs = () => {
        if (!lrSearchTerm.trim()) {
            setSearchResults([]);
            return;
        };

        const lowerQuery = lrSearchTerm.toLowerCase().trim();
        const availableStock = allBookings.filter(b => b.status === 'In Stock');
        const results = availableStock.filter(b => b.lrNo.toLowerCase().includes(lowerQuery));
        setSearchResults(results);
    }
    
    const handleSearchByEwb = () => {
        if (!ewbSearchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        const lowerQuery = ewbSearchTerm.toLowerCase().trim();
        const availableStock = allBookings.filter(b => b.status === 'In Stock');
        const results = availableStock.filter(b => 
            b.itemRows.some(item => item.ewbNo && item.ewbNo.toLowerCase().includes(lowerQuery))
        );
        setSearchResults(results);
    };

    const handleSearchByCity = (city: string | undefined) => {
        setCitySearchTerm(city);
        if (!city) {
            setSearchResults([]);
            return;
        }
        const availableStock = allBookings.filter(b => b.status === 'In Stock');
        const results = availableStock.filter(b => b.toCity.toLowerCase() === city.toLowerCase());
        setSearchResults(results);
    };
    
    const handleAddSelectedToChallan = () => {
        const newlySelectedBookings = searchResults.filter(r => searchSelection.has(r.trackingId));
        const currentLrNos = new Set(addedLrs.map(lr => lr.lrNo));
        const uniqueNewBookings = newlySelectedBookings.filter(b => !currentLrNos.has(b.lrNo));

        setAddedLrs(prev => [...prev, ...uniqueNewBookings]);
        
        // Clear selections and results
        setSearchSelection(new Set());
        setSearchResults([]);
        setLrSearchTerm('');
        setEwbSearchTerm('');
        setCitySearchTerm(undefined);
    };

    const handleRemoveFromChallan = () => {
        setAddedLrs(prev => prev.filter(lr => !addedSelection.has(lr.trackingId)));
        setAddedSelection(new Set());
    };

    const handleEditLrClick = (lrToEdit: Booking) => {
        setBookingDataToEdit(lrToEdit);
        setIsEditDialogOpen(true);
    };

    const handleUpdateLrInList = (updatedBooking: Booking) => {
        setAddedLrs(prev => prev.map(lr => lr.trackingId === updatedBooking.trackingId ? updatedBooking : lr));
        setIsEditDialogOpen(false);
        setBookingDataToEdit(null);
    };

    const buildChallanObject = (status: 'Pending' | 'Finalized', newId?: string): { challan: Challan, lrDetails: LrDetail[] } | null => {
        if (!vehicleNo || !driverName || !toStation) {
            toast({ title: "Missing Information", description: "Vehicle, Driver, and To Station are required.", variant: "destructive" });
            return null;
        }

         const challanDataObject: Challan = {
            challanId: newId || challanId,
            dispatchDate: format(dispatchDate!, 'yyyy-MM-dd'),
            challanType: 'Dispatch',
            status,
            vehicleNo,
            driverName,
            hireReceiptNo: hireReceiptNo,
            fromStation: fromStation?.name || companyProfile?.city || 'N/A',
            toStation: toStation.name,
            dispatchToParty: billTo || toStation.name,
            lorrySupplier: vehicleOwner,
            totalLr: addedLrs.length,
            totalPackages: totalAddedQty,
            totalItems: addedLrs.reduce((sum, b) => sum + (b.itemRows?.length || 0), 0),
            totalActualWeight: addedLrs.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
            totalChargeWeight: totalAddedChgWt,
            vehicleHireFreight: vehicleHireFreight || 0,
            advance: advance || 0,
            balance: balance || 0,
            senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '', remark: remark || '',
            summary: {
                grandTotal: totalFreight,
                totalTopayAmount,
                commission: commission || 0,
                labour: labour || 0,
                crossing: crossing || 0,
                carting: carting || 0, 
                balanceTruckHire: balance || 0,
                debitCreditAmount: debitCreditAmount || 0,
                fuel: fuel || 0,
            }
        };

        const lrDetailsObject: LrDetail[] = addedLrs.map(b => ({
            challanId: newId || challanId,
            lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
            itemDescription: b.itemDescription, quantity: b.qty,
            actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
            chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));

        return { challan: challanDataObject, lrDetails: lrDetailsObject };
    }
    
    const handleSaveOrUpdateChallan = () => {
        const data = buildChallanObject('Pending');
        if (!data) return;

        const { challan: tempChallan, lrDetails: tempLrDetails } = data;

        const allChallans = getChallanData();
        const existingChallanIndex = allChallans.findIndex(c => c.challanId === challanId);

        if (existingChallanIndex !== -1) {
            allChallans[existingChallanIndex] = tempChallan;
        } else {
            allChallans.push(tempChallan);
        }
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData();
        allLrDetails = allLrDetails.filter(d => d.challanId !== challanId);
        allLrDetails.push(...tempLrDetails);
        saveLrDetailsData(allLrDetails);

        const currentBookings = getBookings();
        const addedLrNos = new Set(tempLrDetails.map(lr => lr.lrNo));

        const updatedBookings = currentBookings.map(b => {
             if (addedLrNos.has(b.lrNo)) {
                if (b.status !== 'In Loading') {
                    addHistoryLog(b.lrNo, 'In Loading', companyProfile?.companyName || 'System', `Added to temporary challan ${challanId}`);
                    return { ...b, status: 'In Loading' as const };
                }
             }
             return b;
        });
        saveBookings(updatedBookings);

        toast({ title: isEditMode ? "Challan Updated" : "Challan Saved", description: `Challan ${challanId} has been saved.` });
    };

    const handleFinalizeChallan = () => {
        if (addedLrs.length === 0) {
            toast({ title: "No LRs Added", description: "Please add at least one LR to the challan before finalizing.", variant: "destructive" });
            return;
        }
        
        const isActuallyEditing = isEditMode && !challanId.startsWith('TEMP-');
        
        const allChallans = getChallanData();
        
        let newChallanId = challanId;
        if (!isActuallyEditing) {
            const challanPrefix = companyProfile?.challanPrefix || 'CHLN';
            newChallanId = generatePermanentChallanId(allChallans, challanPrefix);
        }

        const data = buildChallanObject('Finalized', newChallanId);
        if (!data) return;
        
        const { challan: finalChallan, lrDetails: finalLrDetails } = data;

        const existingChallanIndex = allChallans.findIndex(c => c.challanId === challanId);
        if (existingChallanIndex !== -1) {
            allChallans[existingChallanIndex] = finalChallan;
        } else {
             allChallans.push(finalChallan);
        }
        saveChallanData(allChallans);

        // Remove old details and add new finalized details.
        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== challanId);
        allLrDetails.push(...finalLrDetails);
        saveLrDetailsData(allLrDetails);

        const currentBookings = getBookings();
        const addedLrNos = new Set(finalLrDetails.map(lr => lr.lrNo));
        const updatedBookings = currentBookings.map(b => {
            if (addedLrNos.has(b.lrNo)) {
                addHistoryLog(b.lrNo, 'In Transit', companyProfile?.companyName || 'System', `Dispatched from ${finalChallan.fromStation} via Challan ${newChallanId}`);
                return { ...b, status: 'In Transit' as const };
            }
            return b;
        });
        saveBookings(updatedBookings);
        
        // Add Journal Voucher for financial tracking
        if (finalChallan.summary.totalTopayAmount > 0 && finalChallan.dispatchToParty) {
            addVoucher({
                type: 'Journal',
                date: finalChallan.dispatchDate,
                account: finalChallan.dispatchToParty,
                amount: finalChallan.summary.totalTopayAmount,
                narration: `To-Pay amount for Challan #${finalChallan.challanId}`,
            });
        }
        
        toast({ title: isEditMode ? "Challan Updated & Finalized" : "Challan Finalized", description: `Challan ${newChallanId} has been saved.` });
        
        setPreviewData({ challan: finalChallan, bookings: addedLrs });
        setPreviewType('dispatch');
        setIsPreviewOpen(true);
    };
    
    const handlePrintAndClose = () => {
        setIsPreviewOpen(false);
        router.push('/company/challan');
    };
    
    const handleDownloadPdf = async () => {
        const input = printRef.current;
        if (!input || !previewData) return;

        setIsDownloading(true);

        const canvas = await html2canvas(input, { scale: 2 });
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
        let position = 10;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        height -= pdfHeight;

        while (height > 0) {
            position = height - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            height -= pdfHeight;
        }

        pdf.save(`challan-${previewData.challan.challanId}.pdf`);
        setIsDownloading(false);
    };

    const handleExit = () => {
        setIsExitConfirmationOpen(true);
    };

    const vehicleOptions = useMemo(() => {
        if (!vehicleOwner) return vehicles.map(v => ({ label: v.vehicleNo, value: v.vehicleNo }));
        if (vehicleOwner === 'Company Owned') {
            return vehicles.filter(v => v.ownerType === 'Own').map(v => ({ label: v.vehicleNo, value: v.vehicleNo }));
        }
        return vehicles.filter(v => v.ownerType === 'Supplier' && v.supplierName === vehicleOwner).map(v => ({ label: v.vehicleNo, value: v.vehicleNo }));

    }, [vehicles, vehicleOwner]);

    const driverOptions = useMemo(() => drivers.map(d => ({ label: d.name, value: d.name })), [drivers]);
    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);
    const vehicleOwnerOptions = useMemo(() => [
        { label: 'Company Owned', value: 'Company Owned' },
        ...vendors.filter(v => v.type === 'Vehicle Supplier').map(v => ({ label: v.name, value: v.name })),
        { label: 'Others', value: 'Others' }
    ], [vendors]);

    const billToOptions = useMemo(() => {
        const options = new Set<string>();
        if (toStation) {
            const branch = branches.find(b => b.city.toLowerCase() === toStation.name.toLowerCase());
            if (branch) {
                options.add(branch.name);
            }
        }
        addedLrs.forEach(lr => {
            options.add(lr.sender);
            options.add(lr.receiver);
        });
        customers.forEach(c => options.add(c.name));
        return Array.from(options).map(opt => ({ label: opt, value: opt }));
    }, [toStation, branches, addedLrs, customers]);

    const handleAddNewCustomer = (customerData: Omit<Customer, 'id'>) => {
        const allCustomers = getCustomers();
        const newCustomer: Customer = {
            id: allCustomers.length > 0 ? Math.max(...allCustomers.map(c => c.id)) + 1 : 1,
            ...customerData,
        };
        saveCustomers([newCustomer, ...allCustomers]);
        setCustomers(prev => [newCustomer, ...prev]);
        setBillTo(newCustomer.name);
        toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
        return true;
    }


    const formatValue = (amount: number) => companyProfile ? amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount.toFixed(2);


    return (
        <div className="space-y-4">
            <header className="mb-4 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    {isEditMode ? `Edit Dispatch Challan` : 'New Dispatch Challan'}
                </h1>
                <div className="flex justify-end gap-2">
                    {!isFinalized && <Button onClick={handleSaveOrUpdateChallan}><Save className="mr-2 h-4 w-4" />Save Challan</Button>}
                    {!isFinalized && <Button onClick={handleFinalizeChallan} size="lg"><Save className="mr-2 h-4 w-4" /> Finalize</Button>}
                    {isFinalized && <Button onClick={handleSaveOrUpdateChallan}>Update Challan</Button>}
                    <Button onClick={handleExit} variant="destructive"><X className="mr-2 h-4 w-4" /> Exit</Button>
                </div>
            </header>
            <ClientOnly>
                <Collapsible open={isHeaderOpen} onOpenChange={setIsHeaderOpen}>
                    <Card>
                        <CollapsibleTrigger asChild>
                           <div className="w-full cursor-pointer">
                                <CardHeader className="p-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Challan Details</CardTitle>
                                        <ChevronsUpDown className={cn("h-5 w-5 transition-transform", isHeaderOpen && "rotate-180")} />
                                    </div>
                                </CardHeader>
                           </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="pt-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                                    <div className="space-y-1">
                                        <Label>Challan ID</Label>
                                        <Input value={challanId} readOnly className="font-bold text-red-600 bg-red-50 border-red-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Dispatch Date</Label>
                                        <DatePicker date={dispatchDate} setDate={setDispatchDate} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Vehicle Owner</Label>
                                        <Combobox options={vehicleOwnerOptions} value={vehicleOwner} onChange={setVehicleOwner} placeholder="Select Owner..." />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Vehicle Hire Receipt</Label>
                                        <Input 
                                            placeholder="Enter Hire Receipt No."
                                            value={hireReceiptNo}
                                            onChange={e => handleLoadFromHireReceipt(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Vehicle No</Label>
                                        <Combobox options={vehicleOptions} value={vehicleNo} onChange={setVehicleNo} placeholder="Select Vehicle..." />
                                    </div>
                                     <div className="space-y-1">
                                        <Label>Driver Name</Label>
                                        {vehicleOwner === 'Company Owned' ? (
                                            <Combobox options={driverOptions} value={driverName} onChange={handleDriverSelect} placeholder="Select Driver..." />
                                        ) : (
                                            <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Enter Driver Name" />
                                        )}
                                    </div>
                                     <div className="space-y-1">
                                        <Label>Driver Mobile</Label>
                                        <Input value={driverMobile} onChange={(e) => setDriverMobile(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>From Station</Label>
                                        <Combobox options={cityOptions} value={fromStation?.name} onChange={(val) => setFromStation(cities.find(c => c.name === val) || null)} placeholder="Select Origin..." />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>To Station</Label>
                                        <Combobox options={cityOptions} value={toStation?.name} onChange={(val) => setToStation(cities.find(c => c.name === val) || null)} placeholder="Select Destination..." />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label>Bill To</Label>
                                        <Combobox 
                                            options={billToOptions} 
                                            value={billTo} 
                                            onChange={setBillTo} 
                                            placeholder="Select Billing Party..." 
                                            addMessage="Add New Party"
                                            onAdd={() => setIsAddCustomerOpen(true)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
                
                 <div className="space-y-4">
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Add LRs to Challan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="lr">
                                <TabsList>
                                    <TabsTrigger value="lr">Search by LR</TabsTrigger>
                                    <TabsTrigger value="ewb">Search by EWB</TabsTrigger>
                                    <TabsTrigger value="city">Search by City</TabsTrigger>
                                    <TabsTrigger value="scan">Scan Barcode</TabsTrigger>
                                </TabsList>
                                <TabsContent value="lr" className="pt-4">
                                    <div className="flex items-end gap-2">
                                        <div className="w-full max-w-xs">
                                            <Label htmlFor="lr-search">Scan or Enter LR Number</Label>
                                            <Input 
                                                id="lr-search"
                                                placeholder="Enter LR number to search"
                                                value={lrSearchTerm}
                                                onChange={(e) => setLrSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchLrs()}
                                            />
                                        </div>
                                        <Button onClick={handleSearchLrs}>
                                            Search LRs
                                        </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="ewb" className="pt-4">
                                     <div className="flex items-end gap-2">
                                        <div className="w-full max-w-xs">
                                            <Label htmlFor="ewb-search">Enter E-Way Bill Number</Label>
                                            <Input 
                                                id="ewb-search"
                                                placeholder="Enter EWB number"
                                                value={ewbSearchTerm}
                                                onChange={(e) => setEwbSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchByEwb()}
                                            />
                                        </div>
                                        <Button onClick={handleSearchByEwb}>Search by EWB</Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="city" className="pt-4">
                                     <div className="flex items-end gap-2">
                                        <div className="w-full max-w-xs">
                                            <Label htmlFor="city-search">Select Destination City</Label>
                                            <Combobox 
                                                options={cityOptions} 
                                                value={citySearchTerm} 
                                                onChange={handleSearchByCity} 
                                                placeholder="Select city..." 
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                 <TabsContent value="scan" className="pt-4">
                                    <div className="text-muted-foreground p-4 border rounded-md">
                                        Barcode scanning functionality will be implemented here.
                                    </div>
                                </TabsContent>
                            </Tabs>

                             {searchResults.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-sm font-medium">Search Results ({searchResults.length} found)</h4>
                                     <div className="overflow-y-auto max-h-48 border rounded-md">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-card">
                                                <TableRow>
                                                    <TableHead className="w-10"><Checkbox 
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSearchSelection(new Set(searchResults.map(lr => lr.trackingId)));
                                                            else setSearchSelection(new Set());
                                                        }}
                                                        checked={searchResults.length > 0 && searchSelection.size === searchResults.length}
                                                    /></TableHead>
                                                    <TableHead>LR No</TableHead>
                                                    <TableHead>Booking Date</TableHead>
                                                    <TableHead>Item & Description</TableHead>
                                                    <TableHead>To</TableHead>
                                                    <TableHead>Receiver</TableHead>
                                                    <TableHead>Qty</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {searchResults.map(lr => (
                                                    <TableRow key={lr.trackingId}>
                                                        <TableCell><Checkbox 
                                                            checked={searchSelection.has(lr.trackingId)}
                                                            onCheckedChange={(checked) => {
                                                                const newSelection = new Set(searchSelection);
                                                                if (checked) newSelection.add(lr.trackingId);
                                                                else newSelection.delete(lr.trackingId);
                                                                setSearchSelection(newSelection);
                                                            }}
                                                        /></TableCell>
                                                        <TableCell className="whitespace-nowrap">{lr.lrNo}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{format(new Date(lr.bookingDate), 'dd-MMM-yy')}</TableCell>
                                                        <TableCell className="max-w-xs truncate whitespace-nowrap">{lr.itemDescription}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{lr.toCity}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{lr.receiver}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{lr.qty}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleAddSelectedToChallan} disabled={searchSelection.size === 0}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Add Selected to Challan ({searchSelection.size})
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end">
                        <Button onClick={handleRemoveFromChallan} disabled={addedSelection.size === 0} variant="outline" size="sm">
                            <Trash2 className="mr-2 h-4 w-4 text-destructive"/> Remove Selected ({addedSelection.size})
                        </Button>
                    </div>

                    <Card className="h-full flex flex-col">
                        <CardHeader className="p-4">
                            <CardTitle className="text-base font-headline">LRs Added to Challan</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow">
                             <div className="overflow-y-auto max-h-[60vh] border-t">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10 sticky top-0 bg-card">
                                                <Checkbox
                                                    onCheckedChange={(c) => {
                                                        if (c) setAddedSelection(new Set(addedLrs.map(lr => lr.trackingId)));
                                                        else setAddedSelection(new Set());
                                                    }}
                                                    checked={addedLrs.length > 0 && addedSelection.size === addedLrs.length}
                                                />
                                            </TableHead>
                                            <TableHead className="sticky top-0 bg-card whitespace-nowrap">LR No</TableHead>
                                            <TableHead className="sticky top-0 bg-card whitespace-nowrap">Booking Date</TableHead>
                                            <TableHead className="sticky top-0 bg-card whitespace-nowrap">Item & Description</TableHead>
                                            <TableHead className="sticky top-0 bg-card whitespace-nowrap">To</TableHead>
                                            <TableHead className="sticky top-0 bg-card whitespace-nowrap">Sender</TableHead>
                                            <TableHead className="sticky top-0 bg-card whitespace-nowrap">Receiver</TableHead>
                                            <TableHead className="sticky top-0 bg-card text-right whitespace-nowrap">Packages</TableHead>
                                            <TableHead className="sticky top-0 bg-card text-right whitespace-nowrap">Charge Wt.</TableHead>
                                            <TableHead className="sticky top-0 bg-card whitespace-nowrap">Booking Type</TableHead>
                                            <TableHead className="sticky top-0 bg-card text-right whitespace-nowrap">Amount</TableHead>
                                            <TableHead className="sticky top-0 bg-card text-center whitespace-nowrap">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addedLrs.map(lr => (
                                            <TableRow 
                                                key={lr.trackingId} 
                                                data-state={addedSelection.has(lr.trackingId) && "selected"}
                                            >
                                                <TableCell className="whitespace-nowrap">
                                                    <Checkbox
                                                        checked={addedSelection.has(lr.trackingId)}
                                                        onCheckedChange={(checked) => {
                                                            const newSelection = new Set(addedSelection);
                                                            if(checked) newSelection.add(lr.trackingId);
                                                            else newSelection.delete(lr.trackingId);
                                                            setAddedSelection(newSelection);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.lrNo}</TableCell>
                                                <TableCell className="whitespace-nowrap">{format(new Date(lr.bookingDate), 'dd-MMM-yy')}</TableCell>
                                                <TableCell className="max-w-xs truncate whitespace-nowrap">{lr.itemDescription}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.toCity}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.sender}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.receiver}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{lr.qty}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{lr.chgWt.toFixed(2)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.lrType}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{formatValue(lr.totalAmount)}</TableCell>
                                                <TableCell className="text-center whitespace-nowrap">
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditLrClick(lr)}>
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {addedLrs.length === 0 && (
                                            <TableRow><TableCell colSpan={12} className="text-center h-24">No LRs added yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                     <TableFooter>
                                        <TableRow className="font-bold bg-muted/50">
                                            <TableCell colSpan={7} className="text-right whitespace-nowrap">Total LRs: {addedLrs.length}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">{totalAddedQty}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">{totalAddedChgWt.toFixed(2)}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">To-Pay: {formatValue(totalTopayAmount)}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap" colSpan={2}>{formatValue(totalFreight)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Vehicle Hire Calculation</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Vehicle Hire Freight</Label>
                                    <Input value={vehicleHireFreight || 0} onChange={(e) => setVehicleHireFreight(Number(e.target.value) || 0)} className="font-semibold" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Advance Paid</Label>
                                    <Input value={advance || 0} onChange={(e) => setAdvance(Number(e.target.value) || 0)} className="font-semibold" />
                                </div>
                                 <div className="space-y-1">
                                    <Label>Fuel</Label>
                                    <Input value={fuel || 0} onChange={(e) => setFuel(Number(e.target.value) || 0)} />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <Label>Balance</Label>
                                <Input value={balance || 0} readOnly className="font-bold text-green-700" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Challan Freight Summary</CardTitle></CardHeader>
                         <CardContent className="space-y-2">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Commission</Label>
                                    <Input value={commission || 0} onChange={(e) => setCommission(Number(e.target.value) || 0)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Labour</Label>
                                    <Input value={labour || 0} onChange={(e) => setLabour(Number(e.target.value) || 0)} />
                                </div>
                                 <div className="space-y-1">
                                    <Label>Crossing</Label>
                                    <Input value={crossing || 0} onChange={(e) => setCrossing(Number(e.target.value) || 0)} />
                                </div>
                                 <div className="space-y-1">
                                    <Label>Carting</Label>
                                    <Input value={carting || 0} onChange={(e) => setCarting(Number(e.target.value) || 0)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Debit/Credit Amt</Label>
                                    <Input value={debitCreditAmount.toFixed(2)} readOnly className="font-bold text-blue-700" />
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div>
                    <Label>Remarks / Dispatch Note</Label>
                    <Textarea placeholder="Add any special instructions for this dispatch..." value={remark} onChange={(e) => setRemark(e.target.value)} />
                </div>
                
                {previewData && companyProfile && (
                    <Dialog open={isPreviewOpen} onOpenChange={(isOpen) => {
                        if (!isOpen && previewData.challan.status === 'Finalized') {
                            handlePrintAndClose();
                        } else {
                            setIsPreviewOpen(isOpen);
                        }
                    }}>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {previewType === 'loading' ? 'Loading Slip Preview' : 'Dispatch Challan'}: {previewData.challan.challanId}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                                <div ref={printRef} className="bg-white">
                                    {previewType === 'dispatch' ? (
                                        <DispatchChallan 
                                            challan={previewData.challan} 
                                            bookings={previewData.bookings}
                                            profile={companyProfile}
                                            driverMobile={drivers.find(d => d.name === previewData.challan.driverName)?.mobile}
                                        />
                                    ) : (
                                        <LoadingSlip 
                                            challan={previewData.challan} 
                                            bookings={previewData.bookings}
                                            profile={companyProfile}
                                        />
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    Download PDF
                                </Button>
                                <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                                {previewData.challan.status === 'Finalized' && (
                                    <Button onClick={handlePrintAndClose}>Done & Exit</Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                 {bookingDataToEdit && (
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Edit In-Challan LR: {bookingDataToEdit.lrNo}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-grow overflow-auto pr-6">
                                <BookingForm 
                                    isOfflineMode={true}
                                    bookingData={bookingDataToEdit}
                                    onSaveSuccess={handleUpdateLrInList}
                                    onClose={() => setIsEditDialogOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
                 <AlertDialog open={isExitConfirmationOpen} onOpenChange={setIsExitConfirmationOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Would you like to save this challan before exiting?
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => router.push('/company/challan')}>Exit Without Saving</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                                handleSaveOrUpdateChallan();
                                router.push('/company/challan');
                            }}>Save and Exit</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AddCustomerDialog 
                    isOpen={isAddCustomerOpen}
                    onOpenChange={setIsAddCustomerOpen}
                    onSave={handleAddNewCustomer}
                />
            </ClientOnly>
        </div>
    );
}

// Helper functions for table selection
function handleSelectRow(id: string, checked: boolean, currentSelection: Set<string>, setSelection: (ids: Set<string>) => void) {
    const newSelection = new Set(currentSelection);
    if (checked) {
        newSelection.add(id);
    } else {
        newSelection.delete(id);
    }
    setSelection(newSelection);
}

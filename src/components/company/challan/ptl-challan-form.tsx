
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City, Vendor, Customer, Item } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Save, X, Trash2, Search, Calendar as CalendarIcon, Check, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { getChallanData, saveChallanData, type Challan, saveLrDetailsData, getLrDetailsData, LrDetail } from '@/lib/challan-data';
import { addHistoryLog } from '@/lib/history-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { bookingOptions } from '@/lib/booking-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AddVendorDialog } from '../master/add-vendor-dialog';
import { AddDriverDialog } from '../master/add-driver-dialog';
import { LoadingSlip } from './loading-slip';
import { useReactToPrint } from 'react-to-print';


const tdClass = "p-1 whitespace-nowrap text-xs";
const thClass = "p-1 h-9 bg-gray-100 text-gray-700 font-semibold text-xs text-center sticky top-0 z-10 whitespace-nowrap";

const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';
const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';
const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';
const LOCAL_STORAGE_KEY_ITEMS = 'transwise_items';
type CityListSource = 'default' | 'custom';

export interface ShortExtraEntry {
    lrNo: string;
    message: string;
}

interface AdditionalCharges {
    commission: number;
    labour: number;
    crossing: number;
    carting: number;
    otherCharges: number;
    vehFreight: number;
    vehAdvance: number;
    fuelLtr: number;
    fuelAmt: number;
}

interface SlipData {
    challan: Challan;
    lrDetails: LrDetail[];
    driverMobile?: string;
    remark: string;
    shortExtraMessages: ShortExtraEntry[];
}

export function PtlChallanForm() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    // Header Form State
    const [challanNo, setChallanNo] = useState('');
    const [challanDate, setChallanDate] = useState(new Date());
    const [dispatchDate, setDispatchDate] = useState(new Date());
    const [fromStation, setFromStation] = useState<string | undefined>(undefined);
    const [destinationStation, setDestinationStation] = useState<string | undefined>();
    const [dispatchTo, setDispatchTo] = useState<string | undefined>();
    const [vehHireReceiptNo, setVehHireReceiptNo] = useState('');
    const [lorrySupplier, setLorrySupplier] = useState<string | undefined>();
    const [vehicleNo, setVehicleNo] = useState<string | undefined>();
    const [vehicleCapacity, setVehicleCapacity] = useState('');
    const [driverName, setDriverName] = useState<string | undefined>();
    const [driverMobile, setDriverMobile] = useState('');
    const [remark, setRemark] = useState('');
    
    // Refs for focus management
    const vehicleCapacityRef = useRef<HTMLInputElement>(null);


    // Master Data
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    
    // Bookings Data
    const [allStockBookings, setAllStockBookings] = useState<Booking[]>([]);
    const [grSearchTerm, setGrSearchTerm] = useState('');
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
    const [cityFilter, setCityFilter] = useState('all');
    
    // Validation and Dispatch State
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [isWeightAlertOpen, setIsWeightAlertOpen] = useState(false);
    const [isExitAlertOpen, setIsExitAlertOpen] = useState(false);
    const [isOverloaded, setIsOverloaded] = useState(false);
    const [overflowLrNos, setOverflowLrNos] = useState<Set<string>>(new Set());
    const [dispatchQuantities, setDispatchQuantities] = useState<{ [trackingId: string]: number }>({});

    const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharges>({
        commission: 0, labour: 0, crossing: 0, carting: 0, otherCharges: 0,
        vehFreight: 0, vehAdvance: 0, fuelLtr: 0, fuelAmt: 0
    });
    
    // Print/Dialog state
    const [isSlipOpen, setIsSlipOpen] = useState(false);
    const [slipData, setSlipData] = useState<SlipData | null>(null);
    const slipRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        content: () => slipRef.current,
    });


    // Dialog states
    const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
    const [initialVendorData, setInitialVendorData] = useState<Partial<Vendor> | null>(null);
    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
    const [initialDriverData, setInitialDriverData] = useState<Partial<Driver> | null>(null);


    const loadMasterData = useCallback(() => {
        try {
            const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
            if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
            
            const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
            if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
            
            const savedVendors = localStorage.getItem(LOCAL_STORAGE_KEY_VENDORS);
            if (savedVendors) setVendors(JSON.parse(savedVendors));

            const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
            if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
            
            const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
            if (savedItems) setItems(JSON.parse(savedItems));

            const savedSource = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
            const source = savedSource || 'default';
            if (source === 'custom') {
                const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
                setCities(savedCities ? JSON.parse(savedCities) : []);
            } else {
                 const defaultCityObjects = bookingOptions.stations.map((name, index) => ({
                    id: index,
                    name: name,
                    aliasCode: 'N/A',
                    pinCode: 'N/A'
                }));
                setCities(defaultCityObjects);
            }
        } catch (error) {
            console.error("Failed to load master data", error);
        }
    }, []);

    useEffect(() => {
        async function loadInitialData() {
            try {
                const profile = await getCompanyProfile();
                setCompanyProfile(profile);
                if (profile.city) {
                    setFromStation(profile.city);
                }

                loadMasterData();
                const allBookings = getBookings();
                
                const challanIdToLoad = searchParams.get('challanId');
                if (challanIdToLoad) {
                    // MODIFICATION MODE
                    const allChallans = getChallanData();
                    const challanToLoad = allChallans.find(c => c.challanId === challanIdToLoad);
                    const lrDetails = getLrDetailsData().filter(lr => lr.challanId === challanIdToLoad);
                    
                    if (challanToLoad && lrDetails) {
                        setChallanNo(challanToLoad.challanId);
                        setChallanDate(parseISO(challanToLoad.dispatchDate)); // Use dispatch date for both
                        setDispatchDate(parseISO(challanToLoad.dispatchDate));
                        setFromStation(challanToLoad.fromStation);
                        setDestinationStation(challanToLoad.toStation);
                        setDispatchTo(challanToLoad.dispatchToParty);
                        setLorrySupplier(challanToLoad.summary.grandTotal > 0 ? 'Market Vehicle' : 'Own Vehicle'); // Heuristic
                        setVehicleNo(challanToLoad.vehicleNo);
                        setDriverName(challanToLoad.driverName);
                        setRemark(challanToLoad.remark || '');
                        // setVehicleCapacity...
                        
                        const lrNosToLoad = new Set(lrDetails.map(lr => lr.lrNo));
                        const bookingsForChallan = allBookings.filter(b => lrNosToLoad.has(b.lrNo));
                        setSelectedBookings(bookingsForChallan);
                        
                        const dispatchQtys: {[key: string]: number} = {};
                        bookingsForChallan.forEach(b => {
                            const detail = lrDetails.find(lr => lr.lrNo === b.lrNo);
                            if (detail) dispatchQtys[b.trackingId] = detail.quantity;
                        });
                        setDispatchQuantities(dispatchQtys);
                    }
                } else {
                    // NEW CHALLAN MODE
                     setChallanNo(`TEMP-${Date.now().toString().slice(-6)}`);
                }
                
                const ptlStock = allBookings.filter(b => b.loadType === 'PTL' && b.status === 'In Stock');
                setAllStockBookings(ptlStock);
               
            } catch (error) {
                toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, [loadMasterData, toast, searchParams]);

    useEffect(() => {
        const selectedDriver = drivers.find(d => d.name === driverName);
        setDriverMobile(selectedDriver?.mobile || '');
    }, [driverName, drivers]);

    const availableStock = useMemo(() => {
        let bookings = allStockBookings;
        if (fromStation) {
            bookings = bookings.filter(b => b.fromCity.toLowerCase() === fromStation.toLowerCase());
        }
        return bookings;
    }, [allStockBookings, fromStation]);

    const bookingsByCity = useMemo(() => {
        const grouped: { [city: string]: Booking[] } = {};
        let filteredStock = availableStock;
        
        filteredStock.forEach(booking => {
            const cityKey = booking.toCity || 'Unknown';
            if (!grouped[cityKey]) grouped[cityKey] = [];
            grouped[cityKey].push(booking);
        });
        
        let sortedEntries = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
        
        return sortedEntries;

    }, [availableStock]);
    
    const cityWiseFilterOptions = useMemo(() => {
        const citiesFromStock = new Set(availableStock.map(b => b.toCity));
        const options = [{ label: 'All Stations', value: 'all' }];
        citiesFromStock.forEach(city => {
            options.push({ label: city, value: city });
        });
        return options;
    }, [availableStock]);
    
    const calculateProportionalWeight = useCallback((booking: Booking, dispatchQty: number): number => {
        const originalQty = booking.qty;
        const originalWeight = booking.itemRows.reduce((sum, item) => sum + Number(item.actWt), 0);
        if (originalQty === 0 || originalWeight === 0) return 0;
        return (dispatchQty / originalQty) * originalWeight;
    }, []);
    
    const totals = useMemo(() => {
        const totalItems = selectedBookings.reduce((sum, b) => sum + b.itemRows.length, 0);
        const totalPackages = selectedBookings.reduce((sum, b) => {
            const dispatchQty = dispatchQuantities[b.trackingId] ?? b.qty;
            return sum + dispatchQty;
        }, 0);
        const totalActualWeight = selectedBookings.reduce((sum, b) => {
            const dispatchQty = dispatchQuantities[b.trackingId];
            if (dispatchQty !== undefined && dispatchQty !== b.qty) {
                return sum + calculateProportionalWeight(b, dispatchQty);
            }
            return sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0);
        }, 0);
        return { totalItems, totalPackages, totalActualWeight };
    }, [selectedBookings, dispatchQuantities, calculateProportionalWeight]);

    const financialSummary = useMemo(() => {
        const paidAmt = selectedBookings.reduce((sum, b) => b.lrType === 'PAID' ? sum + b.totalAmount : sum, 0);
        const toPayAmt = selectedBookings.reduce((sum, b) => b.lrType === 'TOPAY' ? sum + b.totalAmount : sum, 0);
        const toBeBilledAmt = selectedBookings.reduce((sum, b) => b.lrType === 'TBB' ? sum + b.totalAmount : sum, 0);
        const totalFreight = paidAmt + toPayAmt + toBeBilledAmt;
        const balanceTruckHire = additionalCharges.vehFreight - additionalCharges.vehAdvance;
        const totalCharges = toPayAmt + additionalCharges.commission + additionalCharges.labour + additionalCharges.crossing + additionalCharges.carting + additionalCharges.otherCharges - balanceTruckHire;

        return { paidAmt, toPayAmt, toBeBilledAmt, totalFreight, balanceTruckHire, totalCharges };
    }, [selectedBookings, additionalCharges]);


    const handleChargeChange = (field: keyof AdditionalCharges, value: string) => {
        const numValue = Number(value);
        if (isNaN(numValue)) return;
        setAdditionalCharges(prev => ({ ...prev, [field]: numValue }));
    };

    const handleDispatchQtyChange = (trackingId: string, value: string) => {
        const newQty = Number(value);
        if (isNaN(newQty)) return;
        setDispatchQuantities(prev => ({...prev, [trackingId]: newQty}));
    };

    const addSelectedBookings = useCallback((bookingsToAdd: Booking[]) => {
        const newSelectedBookings = [...selectedBookings, ...bookingsToAdd];
        setSelectedBookings(newSelectedBookings);

        const newDispatchQuantities = { ...dispatchQuantities };
        bookingsToAdd.forEach(b => {
            if (newDispatchQuantities[b.trackingId] === undefined) {
                newDispatchQuantities[b.trackingId] = b.qty;
            }
        });
        setDispatchQuantities(newDispatchQuantities);
        
        if(isOverloaded) {
            const newOverflowNos = new Set(overflowLrNos);
            bookingsToAdd.forEach(b => newOverflowNos.add(b.lrNo));
            setOverflowLrNos(newOverflowNos);
        }
    }, [selectedBookings, dispatchQuantities, isOverloaded, overflowLrNos]);


    const checkWeightAndAddBookings = useCallback((bookingsToAdd: Booking[]) => {
        if (!bookingsToAdd.length) return;

        const vehicleCap = Number(vehicleCapacity) || 0;

        if (vehicleCap > 0 && !isOverloaded) {
            const currentWeight = totals.totalActualWeight;
            const additionalWeight = bookingsToAdd.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0);
            
            if (currentWeight + additionalWeight > vehicleCap) {
                setPendingBookings(bookingsToAdd);
                setIsWeightAlertOpen(true);
                return;
            }
        }
        addSelectedBookings(bookingsToAdd);
        
    }, [vehicleCapacity, isOverloaded, totals.totalActualWeight, addSelectedBookings]);

    const handleConfirmOverload = () => {
        if (!pendingBookings.length) return;
        
        addSelectedBookings(pendingBookings);
        
        const newOverflowNos = new Set(overflowLrNos);
        pendingBookings.forEach(b => newOverflowNos.add(b.lrNo));
        setOverflowLrNos(newOverflowNos);

        setIsOverloaded(true);
        setPendingBookings([]);
        setIsWeightAlertOpen(false);
        toast({ title: "Vehicle is Overloaded", description: "Bookings added despite exceeding vehicle capacity.", variant: "destructive" });
    };

    const handleAddBookingByGr = () => {
        if (!grSearchTerm.trim()) {
            toast({ title: "No GR Number Entered", description: "Please type a GR number to add.", variant: "destructive"});
            return;
        }
        const bookingToAdd = availableStock.find(b => b.lrNo.toLowerCase() === grSearchTerm.trim().toLowerCase());
        
        if (bookingToAdd) {
            if (selectedBookings.some(b => b.trackingId === bookingToAdd.trackingId)) {
                toast({ title: "Already Added", description: `GR No. ${bookingToAdd.lrNo} is already in the consignment list.`, variant: "destructive"});
            } else {
                checkWeightAndAddBookings([bookingToAdd]);
                toast({ title: "Success", description: `Added GR No. ${bookingToAdd.lrNo}.`});
            }
            setGrSearchTerm(''); // Clear input after adding
        } else {
            toast({ title: "Not Found", description: `No booking with GR No. "${grSearchTerm}" found in the available stock for this station.`, variant: "destructive"});
        }
    };
    
    const handleToggleBookingSelection = (trackingId: string, isSelected: boolean | string) => {
        if (isSelected) {
            const bookingToAdd = availableStock.find(b => b.trackingId === trackingId);
            if (bookingToAdd && !selectedBookings.some(b => b.trackingId === bookingToAdd.trackingId)) {
                checkWeightAndAddBookings([bookingToAdd]);
            }
        } else {
            handleRemoveBookingFromConsignment(trackingId);
        }
    };

    const handleCitySelectionChange = (city: string, isChecked: boolean | string) => {
        const cityBookings = bookingsByCity.find(([cityName]) => cityName === city)?.[1] || [];
        if (isChecked) {
            const newBookingsToAdd = cityBookings.filter(b => !selectedBookings.some(sb => sb.trackingId === b.trackingId));
            checkWeightAndAddBookings(newBookingsToAdd);
        } else {
            const cityBookingIds = new Set(cityBookings.map(b => b.trackingId));
            const bookingsToRemove = selectedBookings.filter(b => cityBookingIds.has(b.trackingId));
            bookingsToRemove.forEach(b => handleRemoveBookingFromConsignment(b.trackingId));
        }
    };
    
    const handleRemoveBookingFromConsignment = (trackingId: string) => {
        const bookingToRemove = selectedBookings.find(b => b.trackingId === trackingId);
        const updatedSelection = selectedBookings.filter(b => b.trackingId !== trackingId);
        setSelectedBookings(updatedSelection);

        setDispatchQuantities(prev => {
            const newQuantities = {...prev};
            delete newQuantities[trackingId];
            return newQuantities;
        });

        if (bookingToRemove) {
            const newOverflowNos = new Set(overflowLrNos);
            newOverflowNos.delete(bookingToRemove.lrNo);
            setOverflowLrNos(newOverflowNos);
        }

        // Check if we are back under capacity
        const remainingWeight = updatedSelection.reduce((sum, b) => {
            const dispatchQty = dispatchQuantities[b.trackingId];
            if (dispatchQty !== undefined && dispatchQty !== b.qty) {
                return sum + calculateProportionalWeight(b, dispatchQty);
            }
            return sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0);
        }, 0);

        const vehicleCap = Number(vehicleCapacity) || 0;
        if (vehicleCap > 0 && remainingWeight <= vehicleCap) {
            setIsOverloaded(false);
            setOverflowLrNos(new Set());
        }
    };

    const saveChallan = async (isFinal: boolean): Promise<SlipData | null> => {
        if (!vehicleNo || !driverName || !fromStation || selectedBookings.length === 0 || !dispatchTo) {
            toast({ title: "Validation Error", description: "Vehicle, Driver, From Station, Dispatch To, and at least one booking are required.", variant: "destructive" });
            return null;
        }
    
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
    
        try {
            let allChallans = getChallanData();
            const allLrDetails = getLrDetailsData();
            const allBookings = getBookings();
    
            const newChallanId = challanNo;
    
            const challanPayload: Challan = {
                challanId: newChallanId,
                status: 'Pending',
                dispatchDate: format(dispatchDate, 'yyyy-MM-dd'),
                dispatchToParty: dispatchTo,
                vehicleNo,
                driverName,
                fromStation,
                toStation: destinationStation || selectedBookings.map(b => b.toCity).join(', '),
                senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '',
                challanType: 'Dispatch',
                vehicleHireFreight: additionalCharges.vehFreight,
                advance: additionalCharges.vehAdvance,
                balance: financialSummary.balanceTruckHire,
                totalLr: selectedBookings.length,
                totalPackages: totals.totalPackages,
                totalItems: totals.totalItems,
                totalActualWeight: totals.totalActualWeight,
                totalChargeWeight: selectedBookings.reduce((s, b) => s + b.chgWt, 0),
                remark: remark,
                summary: {
                    grandTotal: financialSummary.totalFreight,
                    totalTopayAmount: financialSummary.toPayAmt,
                    commission: additionalCharges.commission,
                    labour: additionalCharges.labour,
                    crossing: additionalCharges.crossing,
                    carting: additionalCharges.carting,
                    balanceTruckHire: financialSummary.balanceTruckHire,
                    debitCreditAmount: financialSummary.totalCharges,
                }
            };
    
            const existingChallanIndex = allChallans.findIndex(c => c.challanId === newChallanId);
            if (existingChallanIndex > -1) {
                allChallans[existingChallanIndex] = {
                    ...allChallans[existingChallanIndex],
                    ...challanPayload,
                    status: allChallans[existingChallanIndex].status
                };
            } else {
                allChallans.push(challanPayload);
            }
            saveChallanData(allChallans);
    
            const updatedBookings = allBookings.map(booking => {
                if (selectedBookings.some(sb => sb.trackingId === booking.trackingId)) {
                    if (booking.status !== 'In Transit') {
                         addHistoryLog(booking.lrNo, 'In Transit', companyProfile?.companyName || 'Admin', `Dispatched on challan ${newChallanId}`);
                    }
                    return { ...booking, status: 'In Transit' as const };
                }
                return booking;
            });
            saveBookings(updatedBookings);
    
            const otherLrDetails = allLrDetails.filter(d => d.challanId !== newChallanId);
            const newLrDetailsForChallan: LrDetail[] = selectedBookings.map(b => ({
                challanId: newChallanId, lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
                from: b.fromCity, to: b.toCity, bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
                itemDescription: b.itemDescription, quantity: dispatchQuantities[b.trackingId] ?? b.qty,
                actualWeight: calculateProportionalWeight(b, dispatchQuantities[b.trackingId] ?? b.qty),
                chargeWeight: b.chgWt, grandTotal: b.totalAmount
            }));
            saveLrDetailsData([...otherLrDetails, ...newLrDetailsForChallan]);
    
            return { challan: challanPayload, lrDetails: newLrDetailsForChallan, driverMobile, remark, shortExtraMessages: [] };
    
        } catch (error) {
            console.error("Failed to save challan", error);
            toast({ title: "Error", description: "An unexpected error occurred while saving the challan.", variant: "destructive" });
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleFinalize = async () => {
        const savedData = await saveChallan(true);
        if (savedData) {
            toast({ title: "Challan Created", description: `Temporary challan ${challanNo} is now pending.` });
            router.push('/company/challan');
        }
    };
    
    const handleSaveOnExit = async () => {
        if (selectedBookings.length === 0) {
            router.push('/company/challan');
            return;
        }
        const savedData = await saveChallan(false);
        if (savedData) {
            toast({ title: "Challan Saved as Pending", description: `Challan ${challanNo} saved.` });
            router.push('/company/challan');
        } else {
             setIsExitAlertOpen(false); // keep dialog open on failure
        }
    };

    const handleExitClick = () => {
        if (selectedBookings.length > 0) {
            setIsExitAlertOpen(true);
        } else {
            router.push('/company/challan');
        }
    };

    const handlePrintLoadingCopy = async () => {
        const data = await saveChallan(false);
        if (data && companyProfile) {
            setSlipData(data);
            setIsSlipOpen(true);
            toast({ title: "Loading Slip Generated", description: "The challan has been saved as a pending draft." });
        }
    };


    const toStationOptions = useMemo(() => {
        return cities.map(city => ({ label: city.name, value: city.name }));
    }, [cities]);
    
    const dispatchToOptions = useMemo(() => {
        const customerOptions = customers.map(c => ({ label: `${c.name}`, value: c.name }));
        const vendorOptions = vendors.map(v => ({ label: `${v.name}`, value: v.name }));

        return [...customerOptions, ...vendorOptions];
    }, [customers, vendors]);
    
    const lorrySupplierOptions = useMemo(() => {
        const baseOptions = [
            { label: 'Own Vehicle', value: 'Own Vehicle' },
            { label: 'Market Vehicle', value: 'Market Vehicle' }
        ];
        const supplierVendors = vendors
            .filter(v => v.type === 'Vehicle Supplier')
            .map(v => ({ label: v.name, value: v.name }));
        return [...baseOptions, ...supplierVendors];
    }, [vendors]);


    const ownedVehicleOptions = useMemo(() => {
        return vehicles.filter(v => v.ownerType === 'Own').map(v => ({ label: v.vehicleNo, value: v.vehicleNo }));
    }, [vehicles]);
    
    const handleOpenAddVendor = (query?: string) => { setInitialVendorData(query ? { name: query, type: 'Vehicle Supplier' } : null); setIsAddVendorOpen(true); };
    const handleOpenAddDriver = (query?: string) => { setInitialDriverData(query ? { name: query } : null); setIsAddDriverOpen(true); };


    const handleSaveMaster = (storageKey: string, data: any, successMessage: string) => {
        try {
            const savedData = localStorage.getItem(storageKey);
            const currentData = savedData ? JSON.parse(savedData) : [];
            const newId = currentData.length > 0 ? Math.max(...currentData.map((d: any) => d.id)) + 1 : 1;
            const newData = { ...data, id: newId };
            const updatedData = [newData, ...currentData];
            localStorage.setItem(storageKey, JSON.stringify(updatedData));
            toast({ title: 'Success', description: successMessage });
            loadMasterData();
            return {success: true, newData};
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save data.', variant: 'destructive' });
            return {success: false};
        }
    };
    
    const handleSaveVendor = (data: Omit<Vendor, 'id'>) => {
        const result = handleSaveMaster('transwise_vendors', data, `Vendor "${data.name}" added.`);
        if (result.success) setLorrySupplier(result.newData.name);
        return result.success;
    };
    const handleSaveDriver = (data: Omit<Driver, 'id'>) => {
        const result = handleSaveMaster('transwise_drivers', data, `Driver "${data.name}" added.`);
        if (result.success) setDriverName(result.newData.name);
        return result.success;
    };
    
    const handleVehicleNoBlur = () => {
        if (!vehicleNo) return;
        
        if (lorrySupplier !== 'Own Vehicle') {
            const validFormat = /^[A-Z]{2}-?[0-9]{1,2}-?[A-Z]{1,2}-?[0-9]{1,4}$/;
            if (validFormat.test(vehicleNo)) {
                vehicleCapacityRef.current?.focus();
            } else {
                 toast({ title: "Invalid Format", description: "Please use a valid vehicle number format (e.g., MH-31-CQ-1234).", variant: "destructive" });
            }
        } else {
            vehicleCapacityRef.current?.focus();
        }
    };

    const handleOwnedVehicleSelect = (selectedVehicleNo: string) => {
        setVehicleNo(selectedVehicleNo);
        const vehicle = vehicles.find(v => v.vehicleNo === selectedVehicleNo);
        if (vehicle && vehicle.capacity) {
            setVehicleCapacity(String(vehicle.capacity));
        } else {
            setVehicleCapacity('');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    return (
        <div className="space-y-2">
            
            {/* Header Section */}
            <Card>
                 <CardContent className="p-2">
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-2 items-end">
                        <div className="space-y-0.5">
                            <Label className="text-xs">Challan No.</Label>
                            <Input value={challanNo} readOnly className="h-9 text-xs font-bold text-red-600" />
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-xs">Challan Date</Label>
                            <Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full justify-between text-xs px-2"><>{format(challanDate, 'dd/MM/yyyy')}<CalendarIcon className="h-3 w-3" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={challanDate} onSelect={(d) => d && setChallanDate(d)}/></PopoverContent></Popover>
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-xs">Dispatch Date</Label>
                            <Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full justify-between text-xs px-2"><>{format(dispatchDate, 'dd/MM/yyyy')}<CalendarIcon className="h-3 w-3" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dispatchDate} onSelect={(d) => d && setDispatchDate(d)}/></PopoverContent></Popover>
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-xs">From Station</Label>
                            <Input value={fromStation} readOnly className="h-9 text-xs" />
                        </div>
                         <div className="space-y-0.5">
                            <Label className="text-xs">Dispatch To (Party)</Label>
                            <Combobox
                                options={dispatchToOptions}
                                value={dispatchTo}
                                onChange={setDispatchTo}
                                placeholder="Search Party..."
                                searchPlaceholder="Search..."
                            />
                        </div>
                         <div className="space-y-0.5">
                            <Label className="text-xs">Destination Station</Label>
                            <Combobox
                                options={toStationOptions}
                                value={destinationStation}
                                onChange={setDestinationStation}
                                placeholder="Search City"
                                searchPlaceholder="Search City..."
                            />
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-xs">Veh.Hire Receipt No</Label>
                            <Input className="h-9 text-xs" value={vehHireReceiptNo} onChange={e => setVehHireReceiptNo(e.target.value)} />
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-xs">Vehicle Supplier</Label>
                            <Combobox
                                options={lorrySupplierOptions}
                                value={lorrySupplier}
                                onChange={(val) => { setLorrySupplier(val); setVehicleNo(undefined); setVehicleCapacity('') }}
                                placeholder="Select Supplier..."
                                searchPlaceholder="Search suppliers..."
                                addMessage="Add New Supplier"
                                onAdd={handleOpenAddVendor}
                                autoOpenOnFocus={true}
                            />
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-xs">Vehicle No.</Label>
                            {lorrySupplier === 'Own Vehicle' ? (
                                <Combobox
                                    options={ownedVehicleOptions}
                                    value={vehicleNo}
                                    onChange={handleOwnedVehicleSelect}
                                    placeholder="Select Owned Vehicle..."
                                    searchPlaceholder="Search vehicle..."
                                />
                            ) : (
                                <Input 
                                    className="h-9 text-xs" 
                                    placeholder="Enter Market Vehicle No."
                                    value={vehicleNo || ''}
                                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                    onBlur={handleVehicleNoBlur}
                                />
                            )}
                        </div>
                         <div className="space-y-0.5">
                            <Label className="text-xs">Veh.Capacity</Label>
                            <Input ref={vehicleCapacityRef} className="h-9 text-xs" placeholder="Weight In Kg" value={vehicleCapacity} onChange={e => setVehicleCapacity(e.target.value)} />
                        </div>
                         <div className="space-y-0.5">
                            <Label className="text-xs">Driver Name</Label>
                             {lorrySupplier === 'Own Vehicle' ? (
                                 <Combobox
                                    options={drivers.map(d => ({ label: d.name, value: d.name }))}
                                    value={driverName}
                                    onChange={setDriverName}
                                    placeholder="Search or Type Driver..."
                                    searchPlaceholder="Search driver..."
                                    addMessage="Add New Driver"
                                    onAdd={handleOpenAddDriver}
                                />
                             ) : (
                                 <Input 
                                    className="h-9 text-xs"
                                    placeholder="Enter Driver Name"
                                    value={driverName || ''}
                                    onChange={(e) => setDriverName(e.target.value)}
                                />
                             )}
                        </div>
                         <div className="space-y-0.5">
                            <Label className="text-xs">Driver Contact No</Label>
                            <Input value={driverMobile} onChange={e => setDriverMobile(e.target.value)} className="h-9 text-xs" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-2">
                {/* Search/Selection Section */}
                <Card>
                    <CardHeader className="p-2">
                        <CardTitle className="text-sm font-headline">Select Bookings for Challan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <Tabs defaultValue="search">
                            <TabsList className="h-8">
                                <TabsTrigger value="search" className="text-xs h-7">Search &amp; Select GR</TabsTrigger>
                                <TabsTrigger value="citywise" className="text-xs h-7">City-wise Bulk Select</TabsTrigger>
                                <TabsTrigger value="list" className="text-xs h-7">Select From List</TabsTrigger>
                            </TabsList>
                            <TabsContent value="search" className="pt-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Enter GR No. to add..."
                                        value={grSearchTerm}
                                        onChange={(e) => setGrSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddBookingByGr()}
                                        className="h-8"
                                    />
                                    <Button onClick={handleAddBookingByGr} size="sm" className="h-8"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="citywise" className="pt-2 space-y-2">
                                 <div className="flex items-center gap-2">
                                    <Label className="text-xs">Filter by To Station:</Label>
                                    <Select value={cityFilter} onValueChange={setCityFilter}>
                                        <SelectTrigger className="h-7 text-xs w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cityWiseFilterOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <ScrollArea className="h-24 border rounded-md p-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-1">
                                        {bookingsByCity.filter(([cityName]) => cityFilter === 'all' || cityName === cityFilter).map(([city, cityBookings]) => (
                                            <div key={city} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`city-${city}`} 
                                                    onCheckedChange={(c) => handleCitySelectionChange(city, c)} 
                                                    checked={cityBookings.length > 0 && cityBookings.every(b => selectedBookings.some(sb => sb.trackingId === b.trackingId))} 
                                                />
                                                <label htmlFor={`city-${city}`} className="text-xs font-medium">{city} ({cityBookings.length})</label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="list" className="pt-2">
                                <ScrollArea className="h-40 mt-2 border rounded-md">
                                    <Table>
                                        <TableHeader><TableRow><TableHead className={thClass}>Select</TableHead><TableHead className={thClass}>LR No</TableHead><TableHead className={thClass}>To</TableHead><TableHead className={thClass}>Consignee</TableHead><TableHead className={thClass}>Qty</TableHead><TableHead className={thClass}>Chg wt.</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {availableStock.map(b => (
                                                <TableRow key={b.trackingId} className={cn(selectedBookings.some(sb => sb.trackingId === b.trackingId) && 'bg-blue-100/50')}>
                                                    <TableCell className={tdClass}><Checkbox onCheckedChange={(c) => handleToggleBookingSelection(b.trackingId, c)} checked={selectedBookings.some(sb => sb.trackingId === b.trackingId)} /></TableCell>
                                                    <TableCell className={tdClass}>{b.lrNo}</TableCell><TableCell className={tdClass}>{b.toCity}</TableCell><TableCell className={tdClass}>{b.receiver}</TableCell><TableCell className={tdClass}>{b.qty}</TableCell><TableCell className={tdClass}>{b.chgWt.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            
            {/* Consignment Details */}
            <Card>
                 <CardHeader className="p-2">
                    <CardTitle className="text-sm font-headline">Consignment Details</CardTitle>
                    <div className="flex justify-between items-center text-xs font-bold text-red-600 pt-2">
                        <div className="flex gap-4">
                            <span>Total LR's : {selectedBookings.length}</span>
                            <span>Total Items : {totals.totalItems}</span>
                            <span>Total Qty : {totals.totalPackages}</span>
                        </div>
                        <div className="flex gap-4">
                            <span>Actual Wt. : {totals.totalActualWeight.toFixed(2)} kg</span>
                            <span>Available Wt: {Number(vehicleCapacity) > 0 ? (Number(vehicleCapacity) - totals.totalActualWeight).toFixed(2) : '--'} kg</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                    <ScrollArea className="h-40 border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClass}>Sr.No</TableHead><TableHead className={thClass}>LR NO</TableHead><TableHead className={thClass}>To Station</TableHead><TableHead className={thClass}>LR TYPE</TableHead><TableHead className={thClass}>consignor</TableHead><TableHead className={thClass}>consignee</TableHead><TableHead className={thClass}>Item &amp; Description</TableHead><TableHead className={thClass}>Qty</TableHead><TableHead className={thClass}>Disp.Qty</TableHead><TableHead className={thClass}>Act.wt.</TableHead><TableHead className={thClass}>Total Freight</TableHead><TableHead className={thClass}>EWB no</TableHead><TableHead className={thClass}>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedBookings.map((b, i) => {
                                    const dispatchQty = dispatchQuantities[b.trackingId];
                                    const isModified = dispatchQty !== b.qty;
                                    const currentWeight = (isModified && dispatchQty !== undefined)
                                        ? calculateProportionalWeight(b, dispatchQty)
                                        : b.itemRows.reduce((s,i) => s+Number(i.actWt),0);

                                    return (
                                        <TableRow key={b.trackingId} className={cn(overflowLrNos.has(b.lrNo) && "bg-red-200/50", isModified && "bg-yellow-200/50")}>
                                            <TableCell className={tdClass}>{i+1}</TableCell><TableCell className={tdClass}>{b.lrNo}</TableCell><TableCell className={tdClass}>{b.toCity}</TableCell><TableCell className={tdClass}>{b.lrType}</TableCell><TableCell className={tdClass}>{b.sender}</TableCell><TableCell className={tdClass}>{b.receiver}</TableCell><TableCell className={tdClass}>{b.itemDescription}</TableCell><TableCell className={tdClass}>{b.qty}</TableCell>
                                            <TableCell className={tdClass}>
                                                <Input 
                                                    className="h-6 text-xs w-16" 
                                                    value={dispatchQty ?? ''} 
                                                    onChange={(e) => handleDispatchQtyChange(b.trackingId, e.target.value)} 
                                                />
                                            </TableCell>
                                            <TableCell className={tdClass}>{currentWeight.toFixed(2)}</TableCell><TableCell className={tdClass}>{b.totalAmount.toFixed(2)}</TableCell><TableCell className={tdClass}>{b.itemRows[0]?.ewbNo || ''}</TableCell>
                                            <TableCell className={tdClass}><div className="flex items-center"><Button variant="ghost" size="icon" className="h-5 w-5 text-red-600" onClick={() => handleRemoveBookingFromConsignment(b.trackingId)}><X className="h-4 w-4" /></Button></div></TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                    <div className="flex justify-between items-center text-xs font-bold mt-1">
                        <div><span>Paid Amt: {financialSummary.paidAmt.toFixed(2)}</span><span className="ml-4">ToPay Amt:{financialSummary.toPayAmt.toFixed(2)}</span><span className="ml-4">ToBeBilled Amt: {financialSummary.toBeBilledAmt.toFixed(2)}</span></div>
                        <div>Total freight :{financialSummary.totalFreight.toFixed(2)}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                 <Card className="p-1 h-full">
                    <CardHeader className="p-1"><CardTitle className="text-sm font-semibold text-center">Remarks</CardTitle></CardHeader>
                     <CardContent className="p-1">
                        <Textarea placeholder="Remark/Dispatch Note" className="text-xs h-24" value={remark} onChange={(e) => setRemark(e.target.value)} />
                    </CardContent>
                </Card>
                 <Card className="p-1 h-full"><CardHeader className="p-1"><CardTitle className="text-sm font-semibold text-center">Additional Charges</CardTitle></CardHeader>
                    <CardContent className="p-1 space-y-1 text-xs">
                        <div className="flex justify-between font-bold"><span>Total TOPAY:</span><span>{financialSummary.toPayAmt.toFixed(2)}</span></div>
                        <div className="flex justify-between items-center"><span>Comission</span><Input className="h-6 w-24 text-xs" value={additionalCharges.commission} onChange={e => handleChargeChange('commission', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><span>Labor</span><Input className="h-6 w-24 text-xs" value={additionalCharges.labour} onChange={e => handleChargeChange('labour', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><span>Crossing</span><Input className="h-6 w-24 text-xs" value={additionalCharges.crossing} onChange={e => handleChargeChange('crossing', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><span>Carting</span><Input className="h-6 w-24 text-xs" value={additionalCharges.carting} onChange={e => handleChargeChange('carting', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><span>Other Charges</span><Input className="h-6 w-24 text-xs" value={additionalCharges.otherCharges} onChange={e => handleChargeChange('otherCharges', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><span>Veh.Freight</span><Input className="h-6 w-24 text-xs" value={additionalCharges.vehFreight} onChange={e => handleChargeChange('vehFreight', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><span>Veh. Advance</span><Input className="h-6 w-24 text-xs" value={additionalCharges.vehAdvance} onChange={e => handleChargeChange('vehAdvance', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><a>+Add Fuel</a><span><Input className="h-6 w-12 text-xs inline-block" placeholder="Ltr" value={additionalCharges.fuelLtr || ''} onChange={e => handleChargeChange('fuelLtr', e.target.value)} /><Input className="h-6 w-16 text-xs inline-block ml-1" placeholder="Amt" value={additionalCharges.fuelAmt || ''} onChange={e => handleChargeChange('fuelAmt', e.target.value)} /></span></div>
                        <div className="flex justify-between items-center"><span>Balance Truck Hire</span><Input readOnly value={financialSummary.balanceTruckHire.toFixed(2)} className="h-6 w-24 text-xs" /></div>
                        <div className="flex justify-between font-bold text-red-600"><span>Total:</span><span>Rs. {financialSummary.totalCharges.toFixed(2)}</span></div>
                    </CardContent>
                 </Card>
            </div>
            
            {/* Actions */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleExitClick}>Exit</Button>
                <Button variant="outline" onClick={handlePrintLoadingCopy} disabled={isSubmitting || selectedBookings.length === 0}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Loading Copy
                </Button>
                <Button onClick={handleFinalize} disabled={isSubmitting || selectedBookings.length === 0}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save &amp; Finalize
                </Button>
            </div>

            <AlertDialog open={isWeightAlertOpen} onOpenChange={setIsWeightAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Vehicle is Overloaded</AlertDialogTitle>
                        <AlertDialogDescription>
                            Adding these bookings will exceed the vehicle's capacity. Do you want to continue? Overflowed items will be marked in red.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingBookings([])}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmOverload}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={isExitAlertOpen} onOpenChange={setIsExitAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Exit Without Finalizing?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Do you want to save this challan as a pending draft before exiting?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveOnExit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save &amp; Exit
                        </AlertDialogAction>
                        <Button variant="destructive" onClick={() => router.push('/company/challan')}>Exit Without Saving</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={isSlipOpen} onOpenChange={setIsSlipOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Loading Slip</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto p-4 bg-gray-100">
                        <div ref={slipRef}>
                            {slipData && companyProfile && (
                                <LoadingSlip 
                                    challan={slipData.challan} 
                                    lrDetails={slipData.lrDetails}
                                    profile={companyProfile}
                                    driverMobile={slipData.driverMobile}
                                    remark={slipData.remark}
                                    shortExtraMessages={slipData.shortExtraMessages}
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSlipOpen(false)}>Close</Button>
                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <AddVendorDialog 
                isOpen={isAddVendorOpen} 
                onOpenChange={setIsAddVendorOpen} 
                onSave={handleSaveVendor} 
                vendor={initialVendorData}
            />
            <AddDriverDialog 
                isOpen={isAddDriverOpen} 
                onOpenChange={setIsAddDriverOpen} 
                onSave={handleSaveDriver}
                driver={initialDriverData}
            />
        </div>
    );
}

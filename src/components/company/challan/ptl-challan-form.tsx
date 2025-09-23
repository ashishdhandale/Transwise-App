
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City, Vendor, Customer, Item } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Save, X, Trash2, Search, Calendar as CalendarIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { getChallanData, saveChallanData, type Challan, saveLrDetailsData, getLrDetailsData, LrDetail } from '@/lib/challan-data';
import { addHistoryLog } from '@/lib/history-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { bookingOptions } from '@/lib/booking-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const tdClass = "p-1 whitespace-nowrap text-xs";
const thClass = "p-1.5 h-9 bg-gray-100 text-gray-700 font-semibold text-xs text-center sticky top-0 z-10 whitespace-nowrap";

const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';
const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';
const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';
const LOCAL_STORAGE_KEY_ITEMS = 'transwise_items';
type CityListSource = 'default' | 'custom';

interface ShortExtraEntry {
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

interface ManualShortExtraEntry {
    id: number;
    type: 'Extra' | 'Short';
    lrNoInput: string;
    selectedLr: string;
    selectedItem: string;
    originalQty: number;
    loadQty: number;
    wtPerUnit: number;
    actualWt: number;
    loadWt: number;
}

export function PtlChallanForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    // Header Form State
    const [challanNo, setChallanNo] = useState('');
    const [challanDate, setChallanDate] = useState(new Date());
    const [dispatchDate, setDispatchDate] = useState(new Date());
    const [fromStation, setFromStation] = useState<string | undefined>(undefined);
    const [toStation, setToStation] = useState<string | undefined>();
    const [vehHireReceiptNo, setVehHireReceiptNo] = useState('');
    const [vehicleSupplier, setVehicleSupplier] = useState<string | undefined>();
    const [vehicleNo, setVehicleNo] = useState<string | undefined>();
    const [vehicleCapacity, setVehicleCapacity] = useState('');
    const [driverName, setDriverName] = useState<string | undefined>();
    const [driverMobile, setDriverMobile] = useState('');

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
    const [isOverloaded, setIsOverloaded] = useState(false);
    const [overflowLrNos, setOverflowLrNos] = useState<Set<string>>(new Set());
    const [dispatchQuantities, setDispatchQuantities] = useState<{ [trackingId: string]: number }>({});
    const [modifiedQtyLrNos, setModifiedQtyLrNos] = useState<Set<string>>(new Set());
    const [shortExtraMessages, setShortExtraMessages] = useState<ShortExtraEntry[]>([]);
    const [manualShortExtraEntries, setManualShortExtraEntries] = useState<ManualShortExtraEntry[]>([]);

    const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharges>({
        commission: 0, labour: 0, crossing: 0, carting: 0, otherCharges: 0,
        vehFreight: 0, vehAdvance: 0, fuelLtr: 0, fuelAmt: 0
    });


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
                const ptlStock = allBookings.filter(b => b.loadType === 'PTL' && b.status === 'In Stock');
                setAllStockBookings(ptlStock);
                setChallanNo(`TEMP-${Date.now().toString().slice(-6)}`);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, [loadMasterData, toast]);

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
    
    const updateShortExtraLog = (booking: Booking, newDispatchQty: number) => {
        const originalQty = booking.qty;
        const diff = newDispatchQty - originalQty;

        setShortExtraMessages(prev => prev.filter(entry => entry.lrNo !== booking.lrNo));
        setModifiedQtyLrNos(prev => {
            const newSet = new Set(prev);
            newSet.delete(booking.lrNo);
            return newSet;
        });

        if (diff !== 0) {
            const message = diff < 0 
                ? `LR no ${booking.lrNo} ${Math.abs(diff)} Qty is Short.`
                : `LR no ${booking.lrNo} ${diff} Qty is Extra.`;
            
            setShortExtraMessages(prev => [...prev, { lrNo: booking.lrNo, message }]);
            setModifiedQtyLrNos(prev => new Set(prev).add(booking.lrNo));
        }
    }

    const handleDispatchQtyChange = (trackingId: string, value: string) => {
        const newQty = Number(value);
        if (isNaN(newQty)) return;

        setDispatchQuantities(prev => ({...prev, [trackingId]: newQty}));
        const booking = selectedBookings.find(b => b.trackingId === trackingId);
        if (booking) {
            updateShortExtraLog(booking, newQty);
        }
    };

    const addSelectedBookings = (bookingsToAdd: Booking[]) => {
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
    };


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
        toast({ title: "Overload Confirmed", description: "Bookings added despite exceeding vehicle capacity.", variant: "destructive" });
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
            
            const newModifiedNos = new Set(modifiedQtyLrNos);
            newModifiedNos.delete(bookingToRemove.lrNo);
            setModifiedQtyLrNos(newModifiedNos);

            setShortExtraMessages(prev => prev.filter(e => e.lrNo !== bookingToRemove.lrNo));
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

    const handleFinalize = async () => {
        if (!vehicleNo || !driverName || !fromStation || selectedBookings.length === 0) {
            toast({ title: "Validation Error", description: "Vehicle, Driver, and From Station are required, and at least one booking must be selected.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            const allChallans = getChallanData();
            const allLrDetails = getLrDetailsData();
            
            const newChallan: Challan = {
                challanId: challanNo,
                status: 'Pending',
                dispatchDate: format(dispatchDate, 'yyyy-MM-dd'),
                dispatchToParty: toStation || selectedBookings[0].toCity,
                vehicleNo,
                driverName,
                fromStation,
                toStation: toStation || selectedBookings.map(b => b.toCity).join(', '),
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
            
            saveChallanData([...allChallans, newChallan]);
            
            const newLrDetailsForChallan: LrDetail[] = selectedBookings.map(b => ({
                challanId: newChallan.challanId, lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
                from: b.fromCity, to: b.toCity, bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
                itemDescription: b.itemDescription, quantity: dispatchQuantities[b.trackingId] ?? b.qty,
                actualWeight: calculateProportionalWeight(b, dispatchQuantities[b.trackingId] ?? b.qty),
                chargeWeight: b.chgWt, grandTotal: b.totalAmount
            }));

            saveLrDetailsData([...allLrDetails, ...newLrDetailsForChallan]);

            const selectedTrackingIds = new Set(selectedBookings.map(b => b.trackingId));
            const allBookings = getBookings();
            const updatedBookings = allBookings.map(b => {
                if (selectedTrackingIds.has(b.trackingId)) {
                    addHistoryLog(b.lrNo, 'In Transit', companyProfile?.companyName || 'Admin', `Added to loading challan ${newChallan.challanId}`);
                    return { ...b, status: 'In Transit' as const };
                }
                return b;
            });
            saveBookings(updatedBookings);

            toast({ title: "Challan Created", description: `Temporary challan ${newChallan.challanId} is now pending.` });
            router.push('/company/challan');

        } catch (error) {
            console.error("Failed to save challan", error);
            toast({ title: "Error", description: "An unexpected error occurred while saving the challan.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const toStationOptions = useMemo(() => {
        return cities.map(city => ({ label: city.name, value: city.name }));
    }, [cities]);
    
    const vehicleSupplierOptions = useMemo(() => vendors.filter(v => v.type === 'Vehicle Supplier').map(v => ({label: v.name, value: v.name})), [vendors]);
    
    if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    
    return (
        <div className="space-y-2">
            
            {/* Header Section */}
            <Card>
                 <CardContent className="p-2">
                     <div className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-2 text-xs items-end">
                        <div className="space-y-0.5">
                            <Label>Challan No.</Label>
                            <Input value={challanNo} readOnly className="h-9 text-xs font-bold text-red-600" />
                        </div>
                        <div className="space-y-0.5">
                            <Label>Challan Date</Label>
                            <Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full justify-between text-xs px-2"><>{format(challanDate, 'dd/MM/yyyy')}<CalendarIcon className="h-3 w-3" /></></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={challanDate} onSelect={(d) => d && setChallanDate(d)}/></PopoverContent></Popover>
                        </div>
                        <div className="space-y-0.5">
                            <Label>Dispatch Date</Label>
                            <Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full justify-between text-xs px-2"><>{format(dispatchDate, 'dd/MM/yyyy')}<CalendarIcon className="h-3 w-3" /></></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dispatchDate} onSelect={(d) => d && setDispatchDate(d)}/></PopoverContent></Popover>
                        </div>
                        <div className="space-y-0.5">
                            <Label>From Station</Label>
                            <Input value={fromStation} readOnly className="h-9 text-xs" />
                        </div>
                         <div className="space-y-0.5">
                            <Label>To Station</Label>
                            <Combobox
                                options={toStationOptions}
                                value={toStation}
                                onChange={setToStation}
                                placeholder="Search City"
                                searchPlaceholder="Search City..."
                            />
                        </div>
                         <div className="space-y-0.5">
                            <Label>Veh.Hire Receipt No</Label>
                            <Input className="h-9 text-xs" value={vehHireReceiptNo} onChange={e => setVehHireReceiptNo(e.target.value)} />
                        </div>
                        <div className="space-y-0.5">
                            <Label>Vehicle Supplier</Label>
                            <Combobox options={vehicleSupplierOptions} value={vehicleSupplier} onChange={setVehicleSupplier} placeholder="Select Supplier..." />
                        </div>
                        <div className="space-y-0.5">
                            <Label>Vehicle No.</Label>
                            <Combobox options={vehicles.map(v => ({ label: v.vehicleNo, value: v.vehicleNo }))} value={vehicleNo} onChange={setVehicleNo} placeholder="Select Vehicle..." />
                        </div>
                         <div className="space-y-0.5">
                            <Label>Veh.Capacity</Label>
                            <Input className="h-9 text-xs" placeholder="Weight In Kg" value={vehicleCapacity} onChange={e => setVehicleCapacity(e.target.value)} />
                        </div>
                        <div className="space-y-0.5">
                            <Label>Driver Name</Label>
                            <Combobox options={drivers.map(d => ({ label: d.name, value: d.name }))} value={driverName} onChange={setDriverName} placeholder="Select Driver..." />
                        </div>
                         <div className="space-y-0.5">
                            <Label>Driver Contact No</Label>
                            <Input readOnly value={driverMobile} className="h-9 text-xs" />
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
                                    const isModified = modifiedQtyLrNos.has(b.lrNo);
                                    const dispatchQty = dispatchQuantities[b.trackingId];
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
                    <CardHeader className="p-1"><CardTitle className="text-sm font-semibold text-center">Remarks &amp; Summary</CardTitle></CardHeader>
                    <CardContent className="p-1 grid grid-cols-2 gap-1">
                        <Textarea placeholder="Remark/Dispatch Note" className="text-xs h-24" />
                        <ScrollArea className="h-24 border-dashed border-2 rounded-md p-2">
                            {shortExtraMessages.length > 0 ? (
                                <ul className="text-xs space-y-1">
                                    {shortExtraMessages.map(entry => (
                                        <li key={entry.lrNo} className="text-destructive font-medium">{entry.message}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No short/extra quantities</div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
                 <Card className="p-1 h-full"><CardHeader className="p-1"><CardTitle className="text-sm font-semibold text-center">Additional Charges</CardTitle></CardHeader>
                    <CardContent className="p-1 space-y-1 text-xs">
                        <div className="flex justify-between font-bold"><span>Total TOPAY:</span><span>{financialSummary.toPayAmt.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Comission</span><Input className="h-6 w-24 text-xs" value={additionalCharges.commission} onChange={e => handleChargeChange('commission', e.target.value)} /></div>
                        <div className="flex justify-between"><span>Labor</span><Input className="h-6 w-24 text-xs" value={additionalCharges.labour} onChange={e => handleChargeChange('labour', e.target.value)} /></div>
                        <div className="flex justify-between"><span>Crossing</span><Input className="h-6 w-24 text-xs" value={additionalCharges.crossing} onChange={e => handleChargeChange('crossing', e.target.value)} /></div>
                        <div className="flex justify-between"><span>Carting</span><Input className="h-6 w-24 text-xs" value={additionalCharges.carting} onChange={e => handleChargeChange('carting', e.target.value)} /></div>
                        <div className="flex justify-between"><span>Other Charges</span><Input className="h-6 w-24 text-xs" value={additionalCharges.otherCharges} onChange={e => handleChargeChange('otherCharges', e.target.value)} /></div>
                        <div className="flex justify-between"><span>Veh.Freight</span><Input className="h-6 w-24 text-xs" value={additionalCharges.vehFreight} onChange={e => handleChargeChange('vehFreight', e.target.value)} /></div>
                        <div className="flex justify-between"><span>Veh. Advance</span><Input className="h-6 w-24 text-xs" value={additionalCharges.vehAdvance} onChange={e => handleChargeChange('vehAdvance', e.target.value)} /></div>
                        <div className="flex justify-between items-center"><a>+Add Fuel</a><span><Input className="h-6 w-12 text-xs inline-block" placeholder="Ltr" value={additionalCharges.fuelLtr || ''} onChange={e => handleChargeChange('fuelLtr', e.target.value)} /><Input className="h-6 w-16 text-xs inline-block ml-1" placeholder="Amt" value={additionalCharges.fuelAmt || ''} onChange={e => handleChargeChange('fuelAmt', e.target.value)} /></span></div>
                        <div className="flex justify-between"><span>Balance Truck Hire</span><Input readOnly value={financialSummary.balanceTruckHire.toFixed(2)} className="h-6 w-24 text-xs" /></div>
                        <div className="flex justify-between font-bold text-red-600"><span>Total:</span><span>Rs. {financialSummary.totalCharges.toFixed(2)}</span></div>
                    </CardContent>
                 </Card>
            </div>
            
            {/* Extra / Short Entries Section */}
            <Card>
                <CardHeader className="p-2">
                    <CardTitle className="text-sm font-headline">Extra / Short Entries</CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                     <div className="flex items-center gap-2 text-xs border p-2 rounded-md">
                        <Select defaultValue="Extra"><SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Extra">Extra</SelectItem><SelectItem value="Short">Short</SelectItem></SelectContent></Select>
                        <Input placeholder="LR NO" className="w-24 h-8 text-xs" />
                        <Select><SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="SELECT LR" /></SelectTrigger><SelectContent>{selectedBookings.map(b => <SelectItem key={b.trackingId} value={b.lrNo}>{b.lrNo}</SelectItem>)}</SelectContent></Select>
                        <Select><SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="Select Item" /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent></Select>
                        <Input placeholder="QTY" className="w-16 h-8 text-xs" />
                        <Input placeholder="LOAD QTY" className="w-20 h-8 text-xs" />
                        <Input placeholder="Wt/Unit" className="w-20 h-8 text-xs" />
                        <Input placeholder="Act.Wt" className="w-20 h-8 text-xs" />
                        <Input placeholder="Load Wt." className="w-20 h-8 text-xs" />
                        <Button size="sm" className="h-8 bg-green-500 hover:bg-green-600">Add More</Button>
                    </div>
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClass}>#</TableHead>
                                    <TableHead className={thClass}>Extra/Short LR</TableHead>
                                    <TableHead className={thClass}>LR NO</TableHead>
                                    <TableHead className={thClass}>SELECT LR</TableHead>
                                    <TableHead className={thClass}>Select Item</TableHead>
                                    <TableHead className={thClass}>QTY</TableHead>
                                    <TableHead className={thClass}>Load Qty</TableHead>
                                    <TableHead className={thClass}>Wt/Unit</TableHead>
                                    <TableHead className={thClass}>Act.Wt.</TableHead>
                                    <TableHead className={thClass}>Load Wt.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {manualShortExtraEntries.map((entry, index) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className={tdClass}>{index + 1}</TableCell>
                                        <TableCell className={tdClass}>{entry.type}</TableCell>
                                        <TableCell className={tdClass}>{entry.lrNoInput}</TableCell>
                                        <TableCell className={tdClass}>{entry.selectedLr}</TableCell>
                                        <TableCell className={tdClass}>{entry.selectedItem}</TableCell>
                                        <TableCell className={tdClass}>{entry.originalQty}</TableCell>
                                        <TableCell className={tdClass}>{entry.loadQty}</TableCell>
                                        <TableCell className={tdClass}>{entry.wtPerUnit}</TableCell>
                                        <TableCell className={tdClass}>{entry.actualWt}</TableCell>
                                        <TableCell className={tdClass}>{entry.loadWt}</TableCell>
                                    </TableRow>
                                ))}
                                {manualShortExtraEntries.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center h-16 text-muted-foreground text-xs">No manual entries added.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => router.push('/company/challan')}>Exit</Button>
                <Button variant="outline">Print Loading Copy</Button>
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
        </div>
    );
}

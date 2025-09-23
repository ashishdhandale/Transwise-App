

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City, Vendor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Save, X, Trash2, Search, Calendar as CalendarIcon } from 'lucide-react';
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


const tdClass = "p-1 whitespace-nowrap text-xs";
const thClass = "p-1.5 h-9 bg-gray-100 text-gray-700 font-semibold text-xs text-center sticky top-0 z-10 whitespace-nowrap";

const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';
const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';
const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';
type CityListSource = 'default' | 'custom';

export function PtlChallanForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    // Header Form State
    const [lotNo, setLotNo] = useState('');
    const [lotCreationDate, setLotCreationDate] = useState(new Date());
    const [lotDispatchDate, setLotDispatchDate] = useState(new Date());
    const [fromStation, setFromStation] = useState<string | undefined>();
    const [toStation, setToStation] = useState<string | undefined>();
    const [billTo, setBillTo] = useState('==========Branch Offices:============');
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
    
    // Bookings Data
    const [allStockBookings, setAllStockBookings] = useState<Booking[]>([]);
    const [selectedLrForSearch, setSelectedLrForSearch] = useState<string | undefined>();
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);


    const loadMasterData = useCallback(() => {
        try {
            const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
            if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
            
            const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
            if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
            
            const savedVendors = localStorage.getItem(LOCAL_STORAGE_KEY_VENDORS);
            if (savedVendors) setVendors(JSON.parse(savedVendors));

            const savedSource = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
            const source = savedSource || 'default';
            if (source === 'custom') {
                const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
                setCities(savedCities ? JSON.parse(savedCities) : []);
            } else {
                const allBookings = getBookings();
                const uniqueCities = [...new Set([...allBookings.map(b => b.fromCity), ...allBookings.map(b => b.toCity)])];
                setCities(uniqueCities.map((city, i) => ({ id: i, name: city, aliasCode: '', pinCode: '' })));
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
                loadMasterData();
                const allBookings = getBookings();
                const ptlStock = allBookings.filter(b => b.loadType === 'PTL' && b.status === 'In Stock');
                setAllStockBookings(ptlStock);
                if (profile?.city) setFromStation(profile.city);
                setLotNo(`AUTO`);
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

    const stockBookingsFromStation = useMemo(() => {
        if (!fromStation) return allStockBookings;
        return allStockBookings.filter(b => b.fromCity === fromStation);
    }, [allStockBookings, fromStation]);

    const availableBookingsForDropdown = useMemo(() => {
        const selectedTrackingIds = new Set(selectedBookings.map(b => b.trackingId));
        return stockBookingsFromStation
            .filter(b => !selectedTrackingIds.has(b.trackingId))
            .map(b => ({ label: `${b.lrNo} - ${b.toCity} - ${b.receiver}`, value: b.trackingId }));
    }, [stockBookingsFromStation, selectedBookings]);

    const bookingsByCity = useMemo(() => {
        const grouped: { [city: string]: Booking[] } = {};
        stockBookingsFromStation.forEach(booking => {
            const cityKey = booking.toCity || 'Unknown';
            if (!grouped[cityKey]) grouped[cityKey] = [];
            grouped[cityKey].push(booking);
        });
        return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
    }, [stockBookingsFromStation]);

    const handleAddBooking = () => {
        if (!selectedLrForSearch) {
            toast({ title: "No GR Selected", description: "Please select a GR number from the list to add.", variant: "destructive"});
            return;
        }
        const bookingToAdd = stockBookingsFromStation.find(b => b.trackingId === selectedLrForSearch);
        if (bookingToAdd) {
            setSelectedBookings(prev => [...prev, bookingToAdd]);
            setSelectedLrForSearch(undefined);
        }
    };
    
    const handleToggleBookingSelection = (trackingId: string, isSelected: boolean) => {
        if (isSelected) {
            const bookingToAdd = stockBookingsFromStation.find(b => b.trackingId === trackingId);
            if (bookingToAdd && !selectedBookings.some(b => b.trackingId === trackingId)) {
                setSelectedBookings(prev => [...prev, bookingToAdd]);
            }
        } else {
            setSelectedBookings(prev => prev.filter(b => b.trackingId !== trackingId));
        }
    };

    const handleCitySelectionChange = (city: string, isChecked: boolean | string) => {
        const cityBookings = bookingsByCity.find(([cityName]) => cityName === city)?.[1] || [];
        if (isChecked) {
            const newBookingsToAdd = cityBookings.filter(b => !selectedBookings.some(sb => sb.trackingId === b.trackingId));
            setSelectedBookings(prev => [...prev, ...newBookingsToAdd]);
        } else {
            const cityBookingIds = new Set(cityBookings.map(b => b.trackingId));
            setSelectedBookings(prev => prev.filter(b => !cityBookingIds.has(b.trackingId)));
        }
    };
    
    const handleRemoveBookingFromConsignment = (trackingId: string) => {
        setSelectedBookings(prev => prev.filter(b => b.trackingId !== trackingId));
    };

    const totals = useMemo(() => {
        const totalItems = selectedBookings.reduce((sum, b) => sum + b.itemRows.length, 0);
        const totalPackages = selectedBookings.reduce((sum, b) => sum + b.qty, 0);
        const totalActualWeight = selectedBookings.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0);
        return { totalItems, totalPackages, totalActualWeight };
    }, [selectedBookings]);

    const financialSummary = useMemo(() => {
        const paidAmt = selectedBookings.filter(b => b.lrType === 'PAID').reduce((sum, b) => sum + b.totalAmount, 0);
        const toPayAmt = selectedBookings.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0);
        const toBeBilledAmt = selectedBookings.filter(b => b.lrType === 'TBB').reduce((sum, b) => sum + b.totalAmount, 0);
        const totalFreight = paidAmt + toPayAmt + toBeBilledAmt;
        return { paidAmt, toPayAmt, toBeBilledAmt, totalFreight };
    }, [selectedBookings]);


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
            
            const challanId = `CHLN-${Date.now()}`;
            
            const newChallan: Challan = {
                challanId: challanId,
                status: 'Finalized',
                dispatchDate: format(lotDispatchDate, 'yyyy-MM-dd'),
                dispatchToParty: billTo,
                vehicleNo,
                driverName,
                fromStation,
                toStation: toStation || selectedBookings.map(b => b.toCity).join(', '),
                senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '',
                challanType: 'Dispatch',
                vehicleHireFreight: 0, advance: 0, balance: 0,
                totalLr: selectedBookings.length,
                totalPackages: totals.totalPackages,
                totalItems: totals.totalItems,
                totalActualWeight: totals.totalActualWeight,
                totalChargeWeight: selectedBookings.reduce((s, b) => s + b.chgWt, 0),
                summary: {
                    grandTotal: financialSummary.totalFreight,
                    totalTopayAmount: financialSummary.toPayAmt,
                    commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0,
                }
            };
            
            saveChallanData([...allChallans, newChallan]);
            
            const newLrDetailsForChallan: LrDetail[] = selectedBookings.map(b => ({
                challanId: newChallan.challanId, lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
                from: b.fromCity, to: b.toCity, bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
                itemDescription: b.itemDescription, quantity: b.qty,
                actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
                chargeWeight: b.chgWt, grandTotal: b.totalAmount
            }));

            saveLrDetailsData([...allLrDetails, ...newLrDetailsForChallan]);

            const selectedTrackingIds = new Set(selectedBookings.map(b => b.trackingId));
            const allBookings = getBookings();
            const updatedBookings = allBookings.map(b => {
                if (selectedTrackingIds.has(b.trackingId)) {
                    addHistoryLog(b.lrNo, 'Dispatched from Warehouse', companyProfile?.companyName || 'Admin', `Dispatched via vehicle ${vehicleNo} on Challan ${newChallan.challanId}`);
                    return { ...b, status: 'In Transit' as const };
                }
                return b;
            });
            saveBookings(updatedBookings);

            toast({ title: "Challan Finalized", description: `Challan ${newChallan.challanId} has been successfully generated.` });
            router.push('/company/challan');

        } catch (error) {
            console.error("Failed to save challan", error);
            toast({ title: "Error", description: "An unexpected error occurred while saving the challan.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name, value: c.name })), [cities]);
    const vehicleSupplierOptions = useMemo(() => vendors.filter(v => v.type === 'Vehicle Supplier').map(v => ({label: v.name, value: v.name})), [vendors]);


    if (isLoading) return <p>Loading form...</p>;
    
    return (
        <div className="bg-gray-50 p-4 space-y-2">
            <h1 className="text-xl font-bold text-center">New Dispatch</h1>
            
            {/* Header Section */}
            <div className="p-2 border rounded-md bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                <div className="space-y-0.5">
                    <Label>LOT No.</Label>
                    <Input value={lotNo} readOnly className="h-7 text-xs font-bold text-red-600" />
                </div>
                <div className="space-y-0.5">
                    <Label>From Station</Label>
                    <Combobox options={cityOptions} value={fromStation} onChange={setFromStation} placeholder="Select From..." />
                </div>
                <div className="space-y-0.5">
                    <Label>To Station</Label>
                    <Combobox options={cityOptions} value={toStation} onChange={setToStation} placeholder="Select To..." />
                </div>
                 <div className="space-y-0.5">
                    <Label>Lot Creation</Label>
                     <Popover><PopoverTrigger asChild><Button variant="outline" className="h-7 w-full justify-between text-xs px-2"><>{format(lotCreationDate, 'dd/MM/yyyy')}<CalendarIcon className="h-3 w-3" /></></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={lotCreationDate} onSelect={(d) => d && setLotCreationDate(d)}/></PopoverContent></Popover>
                </div>
                <div className="space-y-0.5">
                    <Label>Lot Dispatch</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="h-7 w-full justify-between text-xs px-2"><>{format(lotDispatchDate, 'dd/MM/yyyy')}<CalendarIcon className="h-3 w-3" /></></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={lotDispatchDate} onSelect={(d) => d && setLotDispatchDate(d)}/></PopoverContent></Popover>
                </div>
                 <div className="space-y-0.5 lg:col-span-2">
                    <Label>Bill To:</Label>
                    <Select value={billTo} onValueChange={setBillTo}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="==========Branch Offices:============">==========Branch Offices:============</SelectItem></SelectContent>
                    </Select>
                </div>
                 <div className="space-y-0.5">
                    <Label>Veh.Hire Receipt No</Label>
                    <Input className="h-7 text-xs" value={vehHireReceiptNo} onChange={e => setVehHireReceiptNo(e.target.value)} />
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
                    <Input className="h-7 text-xs" placeholder="Weight In Kg" value={vehicleCapacity} onChange={e => setVehicleCapacity(e.target.value)} />
                </div>
                 <div className="space-y-0.5">
                    <Label>Driver Name</Label>
                     <Combobox options={drivers.map(d => ({ label: d.name, value: d.name }))} value={driverName} onChange={setDriverName} placeholder="Select Driver..." />
                </div>
                 <div className="space-y-0.5">
                    <Label>Driver's Cell Number</Label>
                    <Input className="h-7 text-xs" value={driverMobile} readOnly />
                </div>
            </div>

            {/* Search/Selection Section */}
            <div className="p-2 border rounded-md bg-white">
                <Tabs defaultValue="citywise">
                    <TabsList className="h-8">
                        <TabsTrigger value="searchlr" className="text-xs h-7">Search By LR</TabsTrigger>
                        <TabsTrigger value="citywise" className="text-xs h-7">Citywise</TabsTrigger>
                        <TabsTrigger value="ewbwise" className="text-xs h-7">EWBwise</TabsTrigger>
                    </TabsList>
                    <TabsContent value="searchlr" className="pt-2">
                        <div className="flex items-center gap-2">
                            <Combobox 
                                options={availableBookingsForDropdown}
                                value={selectedLrForSearch}
                                onChange={setSelectedLrForSearch}
                                placeholder="Search & Select GR No..."
                                notFoundMessage="No available GRs for this station."
                            />
                            <Button onClick={handleAddBooking} size="sm" className="h-8"><Search className="mr-2 h-4 w-4" /> Add</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="citywise" className="pt-2">
                         <ScrollArea className="h-32 border rounded-md p-2">
                            <div className="space-y-1">
                                {bookingsByCity.map(([city, bookings]) => (
                                    <div key={city} className="flex items-center space-x-2">
                                        <Checkbox id={`city-${city}`} onCheckedChange={(c) => handleCitySelectionChange(city, c)} checked={bookings.every(b => selectedBookings.some(sb => sb.trackingId === b.trackingId))} />
                                        <label htmlFor={`city-${city}`} className="text-xs font-medium">{city} ({bookings.length})</label>
                                    </div>
                                ))}
                            </div>
                         </ScrollArea>
                    </TabsContent>
                    <TabsContent value="ewbwise" className="pt-2">
                        <p className="text-xs text-muted-foreground">E-Way Bill search functionality to be implemented.</p>
                    </TabsContent>
                </Tabs>
                <ScrollArea className="h-40 mt-2 border rounded-md">
                     <Table>
                        <TableHeader><TableRow><TableHead className={thClass}>Select</TableHead><TableHead className={thClass}>LR No</TableHead><TableHead className={thClass}>LR Type</TableHead><TableHead className={thClass}>Consignor</TableHead><TableHead className={thClass}>Consignee</TableHead><TableHead className={thClass}>From</TableHead><TableHead className={thClass}>To</TableHead><TableHead className={thClass}>Qty</TableHead><TableHead className={thClass}>Act.Chg</TableHead><TableHead className={thClass}>Chg wt.</TableHead><TableHead className={thClass}>Total Freight</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {stockBookingsFromStation.map(b => (
                                <TableRow key={b.trackingId} className={cn(selectedBookings.some(sb => sb.trackingId === b.trackingId) && 'bg-blue-100/50')}>
                                    <TableCell className={tdClass}><Checkbox onCheckedChange={(c) => handleToggleBookingSelection(b.trackingId, c)} checked={selectedBookings.some(sb => sb.trackingId === b.trackingId)} /></TableCell>
                                    <TableCell className={tdClass}>{b.lrNo}</TableCell><TableCell className={tdClass}>{b.lrType}</TableCell><TableCell className={tdClass}>{b.sender}</TableCell><TableCell className={tdClass}>{b.receiver}</TableCell><TableCell className={tdClass}>{b.fromCity}</TableCell><TableCell className={tdClass}>{b.toCity}</TableCell><TableCell className={tdClass}>{b.qty}</TableCell><TableCell className={tdClass}>{b.chgWt}</TableCell><TableCell className={tdClass}>{b.chgWt}</TableCell><TableCell className={tdClass}>{b.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </ScrollArea>
            </div>
            
            {/* Consignment Details */}
            <div className="p-2 border rounded-md bg-white">
                <div className="flex justify-between items-center text-xs font-bold text-red-600 mb-1">
                    <h3>Consignment Details</h3>
                    <div className="flex gap-4">
                        <span>Total LR's : {selectedBookings.length}</span>
                        <span>Total Items : {totals.totalItems}</span>
                        <span>Total Qty : {totals.totalPackages}</span>
                    </div>
                     <div className="flex gap-4">
                        <span>Actual Wt. : {totals.totalActualWeight.toFixed(2)} kg</span>
                        <span>Available Wt: {Number(vehicleCapacity) - totals.totalActualWeight} kg</span>
                    </div>
                </div>
                 <ScrollArea className="h-40 border rounded-md">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={thClass}>Sr.No</TableHead><TableHead className={thClass}>LR NO</TableHead><TableHead className={thClass}>LR TYPE</TableHead><TableHead className={thClass}>consignor</TableHead><TableHead className={thClass}>consignee</TableHead><TableHead className={thClass}>FromStation</TableHead><TableHead className={thClass}>ToStation</TableHead><TableHead className={thClass}>Item & Description</TableHead><TableHead className={thClass}>Qty</TableHead><TableHead className={thClass}>Disp.Qty</TableHead><TableHead className={thClass}>Act.wt.</TableHead><TableHead className={thClass}>Total Freight</TableHead><TableHead className={thClass}>EWB no</TableHead><TableHead className={thClass}>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {selectedBookings.map((b, i) => (
                                <TableRow key={b.trackingId}>
                                    <TableCell className={tdClass}>{i+1}</TableCell><TableCell className={tdClass}>{b.lrNo}</TableCell><TableCell className={tdClass}>{b.lrType}</TableCell><TableCell className={tdClass}>{b.sender}</TableCell><TableCell className={tdClass}>{b.receiver}</TableCell><TableCell className={tdClass}>{b.fromCity}</TableCell><TableCell className={tdClass}>{b.toCity}</TableCell><TableCell className={tdClass}>{b.itemDescription}</TableCell><TableCell className={tdClass}>{b.qty}</TableCell><TableCell className={tdClass}><Input className="h-6 text-xs w-16" defaultValue={b.qty} /></TableCell><TableCell className={tdClass}>{b.itemRows.reduce((s,i) => s+Number(i.actWt),0)}</TableCell><TableCell className={tdClass}>{b.totalAmount.toFixed(2)}</TableCell><TableCell className={tdClass}>{b.itemRows[0]?.ewbNo || ''}</TableCell>
                                    <TableCell className={tdClass}><div className="flex items-center"><Button variant="ghost" size="icon" className="h-5 w-5 text-green-600"><Check /></Button><Button variant="ghost" size="icon" className="h-5 w-5 text-red-600" onClick={() => handleRemoveBookingFromConsignment(b.trackingId)}><X /></Button></div></TableCell>
                                </TableRow>
                            ))}
                         </TableBody>
                     </Table>
                </ScrollArea>
                <div className="flex justify-between items-center text-xs font-bold mt-1">
                    <div><span>Paid Amt: {financialSummary.paidAmt.toFixed(2)}</span><span className="ml-4">ToPay Amt:{financialSummary.toPayAmt.toFixed(2)}</span><span className="ml-4">ToBeBilled Amt: {financialSummary.toBeBilledAmt.toFixed(2)}</span></div>
                    <div>Total freight :{financialSummary.totalFreight.toFixed(2)}</div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="space-y-1">
                    <Card className="p-1 h-full"><CardHeader className="p-1"><CardTitle className="text-sm font-semibold text-center">Extra / Short Entries</CardTitle></CardHeader><CardContent className="p-1"><div className="h-24 border-dashed border-2 rounded-md flex items-center justify-center text-muted-foreground text-xs">Not Implemented</div></CardContent></Card>
                </div>
                 <div className="space-y-1">
                     <Card className="p-1 h-full"><CardHeader className="p-1"><CardTitle className="text-sm font-semibold text-center">Remarks & Summary</CardTitle></CardHeader><CardContent className="p-1 grid grid-cols-2 gap-1"><Textarea placeholder="Remark/Dispatch Note" className="text-xs h-24" /><Textarea placeholder="Dispatch Summary" className="text-xs h-24" /></CardContent></Card>
                </div>
                 <div className="space-y-1">
                     <Card className="p-1 h-full"><CardHeader className="p-1"><CardTitle className="text-sm font-semibold text-center">Additional Charges</CardTitle></CardHeader><CardContent className="p-1 space-y-1 text-xs"><div className="flex justify-between font-bold"><span>Total TOPAY:</span><span>{financialSummary.toPayAmt.toFixed(2)}</span></div><div className="flex justify-between"><span>Comission</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between"><span>Labor</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between"><span>Crossing</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between"><span>Carting</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between"><span>Other Charges</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between"><span>Veh.Freight</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between"><span>Veh. Advance</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between items-center"><a>+Add Fuel</a><span><Input className="h-6 w-12 text-xs inline-block" placeholder="Ltr"/><Input className="h-6 w-16 text-xs inline-block ml-1" placeholder="Amt"/></span></div><div className="flex justify-between"><span>Balance Truck Hire</span><Input className="h-6 w-24 text-xs" /></div><div className="flex justify-between font-bold text-red-600"><span>Dr/Cr Amount</span><span>Rs. 12346546</span></div></CardContent></Card>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => router.push('/company/challan')}>Exit</Button>
                <Button variant="outline">Print Loading Copy</Button>
                <Button onClick={handleFinalize} disabled={isSubmitting || selectedBookings.length === 0}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Finalize
                </Button>
            </div>
        </div>
    );
}



'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Save, X, Trash2 } from 'lucide-react';
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

const tdClass = "p-2 whitespace-nowrap";

const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';
const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';
type CityListSource = 'default' | 'custom';

export function PtlChallanForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    // Form State
    const [challanId, setChallanId] = useState('');
    const [challanDate, setChallanDate] = useState(new Date());
    const [vehicleNo, setVehicleNo] = useState<string | undefined>();
    const [driverName, setDriverName] = useState<string | undefined>();
    const [fromStation, setFromStation] = useState<string | undefined>();
    const [toStation, setToStation] = useState<string | undefined>();
    const [dispatchToParty, setDispatchToParty] = useState('');
    
    // Master Data
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    
    // Bookings Data
    const [allStockBookings, setAllStockBookings] = useState<Booking[]>([]);
    const [selectedLr, setSelectedLr] = useState<string | undefined>();
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);


    const loadMasterData = useCallback(() => {
        try {
            const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
            if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
            
            const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
            if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
            
            const savedSource = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
            const source = savedSource || 'default';

            if (source === 'custom') {
                const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
                const parsedCities: City[] = savedCities ? JSON.parse(savedCities) : [];
                setCities(parsedCities);
            } else {
                const allBookings = getBookings();
                const uniqueCities = [...new Set([...allBookings.map(b => b.fromCity), ...allBookings.map(b => b.toCity)])];
                const cityObjects = uniqueCities.map((city, i) => ({ id: i, name: city, aliasCode: '', pinCode: '' }));
                setCities(cityObjects);
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
                if (profile?.city) {
                    setFromStation(profile.city);
                }
                setChallanId(`TEMP-CHLN-${Date.now()}`);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, [loadMasterData, toast]);

    
    useEffect(() => {
        // When the 'To Station' changes, update the 'Dispatch To Party'
        if (toStation) {
            setDispatchToParty(`${toStation} Branch`);
        } else {
            setDispatchToParty('');
        }
    }, [toStation]);
    
    const stockBookingsFromStation = useMemo(() => {
        if (!fromStation) return [];
        return allStockBookings.filter(b => b.fromCity === fromStation);
    }, [allStockBookings, fromStation]);

    const availableBookingsForDropdown = useMemo(() => {
        const selectedLrNos = new Set(selectedBookings.map(b => b.lrNo));
        return stockBookingsFromStation
            .filter(b => !selectedLrNos.has(b.lrNo))
            .map(b => ({ label: `${b.lrNo} - ${b.toCity} - ${b.receiver}`, value: b.lrNo }));
    }, [stockBookingsFromStation, selectedBookings]);

    const bookingsByCity = useMemo(() => {
        const grouped: { [city: string]: Booking[] } = {};
        stockBookingsFromStation.forEach(booking => {
            const cityKey = booking.toCity || 'Unknown';
            if (!grouped[cityKey]) {
                grouped[cityKey] = [];
            }
            grouped[cityKey].push(booking);
        });
        return Object.entries(grouped).sort((a,b) => a[0].localeCompare(b[0]));
    }, [stockBookingsFromStation]);

    const handleAddBooking = () => {
        if (!selectedLr) {
            toast({ title: "No GR Selected", description: "Please select a GR number from the list to add.", variant: "destructive"});
            return;
        }
        const bookingToAdd = stockBookingsFromStation.find(b => b.lrNo === selectedLr);
        if (bookingToAdd) {
            setSelectedBookings(prev => [...prev, bookingToAdd]);
            setSelectedLr(undefined); // Reset dropdown
        }
    }

    const handleCitySelectionChange = (city: string, isChecked: boolean | string) => {
        const cityBookings = bookingsByCity.find(([cityName]) => cityName === city)?.[1] || [];
        if (isChecked) {
            // Add bookings from this city that aren't already selected
            const newBookingsToAdd = cityBookings.filter(b => !selectedBookings.some(sb => sb.trackingId === b.trackingId));
            setSelectedBookings(prev => [...prev, ...newBookingsToAdd]);
        } else {
            // Remove all bookings from this city
            const cityBookingIds = new Set(cityBookings.map(b => b.trackingId));
            setSelectedBookings(prev => prev.filter(b => !cityBookingIds.has(b.trackingId)));
        }
    }
    
    const handleRemoveBooking = (lrNoToRemove: string) => {
        setSelectedBookings(prev => prev.filter(b => b.lrNo !== lrNoToRemove));
    }


    const totals = useMemo(() => {
        const totalPackages = selectedBookings.reduce((sum, b) => sum + b.qty, 0);
        const totalWeight = selectedBookings.reduce((sum, b) => sum + b.chgWt, 0);
        return { totalPackages, totalWeight };
    }, [selectedBookings]);
    
    const handleSaveChallan = async () => {
        if (!vehicleNo || !driverName || !fromStation || selectedBookings.length === 0) {
            toast({ title: "Validation Error", description: "Vehicle, Driver, From Station are required, and at least one booking must be selected.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            const allChallans = getChallanData();
            const allLrDetails = getLrDetailsData();
            
            const newChallan: Challan = {
                challanId: challanId,
                status: 'Pending',
                dispatchDate: format(challanDate, 'yyyy-MM-dd'),
                dispatchToParty: dispatchToParty || (toStation ? `${toStation} Branch` : ''),
                vehicleNo,
                driverName,
                fromStation,
                toStation: toStation || selectedBookings.map(b => b.toCity).join(', '),
                senderId: '',
                inwardId: '',
                inwardDate: '',
                receivedFromParty: '',
                challanType: 'Dispatch',
                vehicleHireFreight: 0,
                advance: 0,
                balance: 0,
                totalLr: selectedBookings.length,
                totalPackages: totals.totalPackages,
                totalItems: selectedBookings.reduce((sum, b) => sum + b.itemRows.length, 0),
                totalActualWeight: selectedBookings.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
                totalChargeWeight: totals.totalWeight,
                summary: {
                    grandTotal: selectedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
                    totalTopayAmount: selectedBookings.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0),
                    commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0,
                }
            };
            
            saveChallanData([...allChallans, newChallan]);
            
            const newLrDetailsForChallan: LrDetail[] = selectedBookings.map(b => ({
                challanId: newChallan.challanId,
                lrNo: b.lrNo,
                lrType: b.lrType,
                sender: b.sender,
                receiver: b.receiver,
                from: b.fromCity,
                to: b.toCity,
                bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
                itemDescription: b.itemDescription,
                quantity: b.qty,
                actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
                chargeWeight: b.chgWt,
                grandTotal: b.totalAmount
            }));

            saveLrDetailsData([...allLrDetails, ...newLrDetailsForChallan]);

            // Update booking statuses
            const selectedLrNos = new Set(selectedBookings.map(b => b.lrNo));
            const allBookings = getBookings();
            const updatedBookings = allBookings.map(b => {
                if (selectedLrNos.has(b.lrNo)) {
                    addHistoryLog(b.lrNo, 'Dispatched from Warehouse', companyProfile?.companyName || 'Admin', `Dispatched via vehicle ${vehicleNo} on Challan ${newChallan.challanId}`);
                    return { ...b, status: 'In Transit' as const };
                }
                return b;
            });
            saveBookings(updatedBookings);

            toast({ title: "Challan Created", description: `Challan ${newChallan.challanId} has been successfully generated.` });
            router.push('/company/challan');

        } catch (error) {
            console.error("Failed to save challan", error);
            toast({ title: "Error", description: "An unexpected error occurred while saving the challan.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name, value: c.name })), [cities]);


    if (isLoading) {
        return <p>Loading form...</p>;
    }
    
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-primary">Create PTL Challan</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Dispatch Section (Challan Header)</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="space-y-1">
                        <Label>Challan No.</Label>
                        <Input value={challanId} readOnly className="font-bold text-red-600 bg-red-50/50 border-red-200" />
                    </div>
                     <div className="space-y-1">
                        <Label>Challan Date</Label>
                        <Input value={format(challanDate, 'dd-MMM-yyyy')} readOnly />
                    </div>
                     <div className="space-y-1">
                        <Label>From Station</Label>
                        <Combobox options={cityOptions} value={fromStation} onChange={setFromStation} placeholder="Select From..." />
                    </div>
                    <div className="space-y-1">
                        <Label>Primary To Station</Label>
                        <Combobox options={cityOptions} value={toStation} onChange={setToStation} placeholder="Select To..." />
                    </div>
                    <div className="space-y-1">
                        <Label>Vehicle No</Label>
                        <Combobox options={vehicles.map(v => ({ label: v.vehicleNo, value: v.vehicleNo }))} value={vehicleNo} onChange={setVehicleNo} placeholder="Select Vehicle..." />
                    </div>
                    <div className="space-y-1">
                        <Label>Driver Name</Label>
                        <Combobox options={drivers.map(d => ({ label: d.name, value: d.name }))} value={driverName} onChange={setDriverName} placeholder="Select Driver..." />
                    </div>
                     <div className="space-y-1 col-span-1 md:col-span-2">
                        <Label>Dispatch To (Receiver)</Label>
                        <Input 
                            value={dispatchToParty} 
                            onChange={(e) => setDispatchToParty(e.target.value)}
                            placeholder="e.g., Branch, Agent, Party"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Select Bookings for Challan</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="search">
                        <TabsList>
                            <TabsTrigger value="search">Search & Select</TabsTrigger>
                            <TabsTrigger value="citywise">City-wise</TabsTrigger>
                        </TabsList>
                        <TabsContent value="search" className="pt-4">
                             <div className="flex items-end gap-2">
                                <div className="flex-grow space-y-1">
                                    <Label>Available Bookings from {fromStation || '...'}</Label>
                                    <Combobox 
                                        options={availableBookingsForDropdown}
                                        value={selectedLr}
                                        onChange={setSelectedLr}
                                        placeholder="Search & Select GR No..."
                                        notFoundMessage="No available GRs for this station."
                                    />
                                </div>
                                <Button onClick={handleAddBooking}><PlusCircle className="mr-2 h-4 w-4" /> Add to Challan</Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="citywise" className="pt-4">
                             <Label>Select all bookings for a destination city:</Label>
                             <ScrollArea className="h-48 mt-2 border rounded-md p-4">
                                <div className="space-y-2">
                                    {bookingsByCity.map(([city, bookings]) => (
                                        <div key={city} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`city-${city}`}
                                                onCheckedChange={(checked) => handleCitySelectionChange(city, checked)}
                                                checked={bookings.every(b => selectedBookings.some(sb => sb.trackingId === b.trackingId))}
                                            />
                                            <label
                                                htmlFor={`city-${city}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {city} ({bookings.length} GRs)
                                            </label>
                                        </div>
                                    ))}
                                </div>
                             </ScrollArea>
                        </TabsContent>
                    </Tabs>
                    
                    <div className="mt-4 overflow-x-auto border rounded-md max-h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center">Action</TableHead>
                                    <TableHead>LR No</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Sender</TableHead>
                                    <TableHead>Receiver</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Chg. Wt.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedBookings.length > 0 ? selectedBookings.map(booking => (
                                    <TableRow key={booking.trackingId}>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveBooking(booking.lrNo)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className={cn(tdClass, "font-medium")}>{booking.lrNo}</TableCell>
                                        <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yy')}</TableCell>
                                        <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                        <TableCell className={tdClass}>{booking.sender}</TableCell>
                                        <TableCell className={tdClass}>{booking.receiver}</TableCell>
                                        <TableCell className={cn(tdClass, "text-right")}>{booking.qty}</TableCell>
                                        <TableCell className={cn(tdClass, "text-right")}>{booking.chgWt}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No bookings selected. Add GRs to include them in the challan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            {selectedBookings.length > 0 && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-right font-bold">TOTALS</TableCell>
                                        <TableCell className="text-right font-bold">{totals.totalPackages}</TableCell>
                                        <TableCell className="text-right font-bold">{totals.totalWeight.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button onClick={handleSaveChallan} disabled={isSubmitting || selectedBookings.length === 0}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Create Challan
                </Button>
                <Button variant="outline" onClick={() => router.push('/company/challan')} disabled={isSubmitting}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                </Button>
            </div>
        </div>
    );
}

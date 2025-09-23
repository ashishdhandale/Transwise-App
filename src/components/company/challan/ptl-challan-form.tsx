

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { getChallanData, saveChallanData, type Challan, saveLrDetailsData, getLrDetailsData, LrDetail } from '@/lib/challan-data';
import { addHistoryLog } from '@/lib/history-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { useRouter } from 'next/navigation';

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
    const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
    const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());

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
                setAvailableBookings(ptlStock);
                if (profile?.city) {
                    setFromStation(profile.city);
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, [loadMasterData, toast]);

    const handleBookingSelection = (lrNo: string, checked: boolean | string) => {
        const newSelection = new Set(selectedBookings);
        if (checked) {
            newSelection.add(lrNo);
        } else {
            newSelection.delete(lrNo);
        }
        setSelectedBookings(newSelection);
    };

    const bookingsToDisplay = useMemo(() => {
        if (!fromStation) return [];
        return availableBookings.filter(b => b.fromCity === fromStation);
    }, [availableBookings, fromStation]);
    
    useEffect(() => {
        // When the 'To Station' changes, update the 'Dispatch To Party'
        if (toStation) {
            setDispatchToParty(`${toStation} Branch`);
        } else {
            setDispatchToParty('');
        }
    }, [toStation]);

    const selectedBookingDetails = useMemo(() => {
        return bookingsToDisplay.filter(b => selectedBookings.has(b.lrNo));
    }, [bookingsToDisplay, selectedBookings]);

    const totals = useMemo(() => {
        const totalPackages = selectedBookingDetails.reduce((sum, b) => sum + b.qty, 0);
        const totalWeight = selectedBookingDetails.reduce((sum, b) => sum + b.chgWt, 0);
        return { totalPackages, totalWeight };
    }, [selectedBookingDetails]);
    
    const handleSaveChallan = async () => {
        if (!vehicleNo || !driverName || !fromStation || !toStation || !dispatchToParty || selectedBookings.size === 0) {
            toast({ title: "Validation Error", description: "Please fill all fields and select at least one booking.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            const allChallans = getChallanData();
            const allLrDetails = getLrDetailsData();
            
            const newChallan: Challan = {
                challanId: `TEMP-CHLN-${Date.now()}`,
                status: 'Pending',
                dispatchDate: format(new Date(), 'yyyy-MM-dd'),
                dispatchToParty: dispatchToParty,
                vehicleNo,
                driverName,
                fromStation,
                toStation, // Primary destination
                senderId: '', // PTL challan may not have a single sender
                inwardId: '',
                inwardDate: '',
                receivedFromParty: '',
                challanType: 'Dispatch',
                vehicleHireFreight: 0, // Not typically set for PTL manifest
                advance: 0,
                balance: 0,
                totalLr: selectedBookings.size,
                totalPackages: totals.totalPackages,
                totalItems: selectedBookingDetails.reduce((sum, b) => sum + b.itemRows.length, 0),
                totalActualWeight: selectedBookingDetails.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
                totalChargeWeight: totals.totalWeight,
                summary: { // Simplified for PTL
                    grandTotal: selectedBookingDetails.reduce((sum, b) => sum + b.totalAmount, 0),
                    totalTopayAmount: selectedBookingDetails.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0),
                    commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0,
                }
            };
            
            saveChallanData([...allChallans, newChallan]);
            
            const newLrDetailsForChallan: LrDetail[] = selectedBookingDetails.map(b => ({
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
            const allBookings = getBookings();
            const updatedBookings = allBookings.map(b => {
                if (selectedBookings.has(b.lrNo)) {
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
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                     <div className="space-y-1">
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
                    <div className="overflow-x-auto border rounded-md max-h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => {
                                        const newSelection = new Set<string>();
                                        if (checked) {
                                            bookingsToDisplay.forEach(b => newSelection.add(b.lrNo));
                                        }
                                        setSelectedBookings(newSelection);
                                    }}
                                    checked={bookingsToDisplay.length > 0 && selectedBookings.size === bookingsToDisplay.length}
                                     /></TableHead>
                                    <TableHead>LR No</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>To Station</TableHead>
                                    <TableHead>Sender</TableHead>
                                    <TableHead>Receiver</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Chg. Wt.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookingsToDisplay.length > 0 ? bookingsToDisplay.map(booking => (
                                    <TableRow key={booking.trackingId}>
                                        <TableCell>
                                            <Checkbox 
                                                id={`select-${booking.trackingId}`}
                                                checked={selectedBookings.has(booking.lrNo)}
                                                onCheckedChange={(checked) => handleBookingSelection(booking.lrNo, checked)}
                                            />
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
                                            No available PTL bookings for the selected route. Change the "From Station" to see bookings.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            {selectedBookingDetails.length > 0 && (
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
                <Button onClick={handleSaveChallan} disabled={isSubmitting || selectedBookings.size === 0}>
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

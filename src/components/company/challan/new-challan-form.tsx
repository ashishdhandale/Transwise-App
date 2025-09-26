
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Search, Truck, User, MapPin, ArrowDown, ArrowUp, Save } from 'lucide-react';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, City } from '@/lib/types';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { format } from 'date-fns';

const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';
const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap px-2 py-1 h-9";

export function NewChallanForm() {
    const [inStockLrs, setInStockLrs] = useState<Booking[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    const [stockSelection, setStockSelection] = useState<Set<string>>(new Set());
    const [addedSelection, setAddedSelection] = useState<Set<string>>(new Set());
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    
    // Form fields
    const [challanId, setChallanId] = useState('');
    const [dispatchDate, setDispatchDate] = useState<Date | undefined>(new Date());
    const [vehicleNo, setVehicleNo] = useState<string | undefined>(undefined);
    const [driverName, setDriverName] = useState<string | undefined>(undefined);
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);

    // Master data
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    
    const { toast } = useToast();

    useEffect(() => {
        async function loadInitialData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);

            const allBookings = getBookings();
            setInStockLrs(allBookings.filter(b => b.status === 'In Stock'));

            setChallanId(`CHLN-${Date.now()}`);

            const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
            if(savedVehicles) setVehicles(JSON.parse(savedVehicles));

            const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
            if(savedDrivers) setDrivers(JSON.parse(savedDrivers));
            
            const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
            if(savedCities) setCities(JSON.parse(savedCities));

            if(profile.city) {
                const defaultStation = JSON.parse(savedCities || '[]').find((c: City) => c.name.toLowerCase() === profile.city.toLowerCase()) || null;
                setFromStation(defaultStation);
            }
        }
        loadInitialData();
    }, []);

    const handleAddToChallan = () => {
        const toAdd = inStockLrs.filter(lr => stockSelection.has(lr.trackingId));
        setAddedLrs(prev => [...prev, ...toAdd]);
        setInStockLrs(prev => prev.filter(lr => !stockSelection.has(lr.trackingId)));
        setStockSelection(new Set());
    };

    const handleRemoveFromChallan = () => {
        const toRemove = addedLrs.filter(lr => addedSelection.has(lr.trackingId));
        setInStockLrs(prev => [...prev, ...toRemove]);
        setAddedLrs(prev => prev.filter(lr => !addedSelection.has(lr.trackingId)));
        setAddedSelection(new Set());
    };
    
    const handleFinalizeChallan = () => {
        if (!vehicleNo || !driverName || !toStation || addedLrs.length === 0) {
            toast({ title: "Missing Information", description: "Please provide Vehicle, Driver, To Station and add at least one LR.", variant: "destructive" });
            return;
        }

        const allChallans = getChallanData();
        const newChallan: Challan = {
            challanId,
            dispatchDate: format(dispatchDate!, 'yyyy-MM-dd'),
            challanType: 'Dispatch',
            status: 'Finalized',
            vehicleNo,
            driverName,
            fromStation: fromStation?.name || companyProfile?.city || 'N/A',
            toStation: toStation.name,
            dispatchToParty: toStation.name,
            totalLr: addedLrs.length,
            totalPackages: addedLrs.reduce((sum, b) => sum + b.qty, 0),
            totalItems: addedLrs.reduce((sum, b) => sum + (b.itemRows?.length || 0), 0),
            totalActualWeight: addedLrs.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
            totalChargeWeight: addedLrs.reduce((sum, b) => sum + b.chgWt, 0),
            vehicleHireFreight: 0, advance: 0, balance: 0,
            senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '',
            summary: {
                grandTotal: addedLrs.reduce((sum, b) => sum + b.totalAmount, 0),
                totalTopayAmount: addedLrs.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0),
                commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0,
            }
        };

        saveChallanData([...allChallans, newChallan]);

        const newLrDetails: LrDetail[] = addedLrs.map(b => ({
            challanId,
            lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
            itemDescription: b.itemDescription, quantity: b.qty,
            actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
            chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));

        const allLrDetails = getLrDetailsData();
        saveLrDetailsData([...allLrDetails, ...newLrDetails]);

        const allBookings = getBookings();
        const updatedBookings = allBookings.map(b => {
            const wasAdded = addedLrs.some(addedLr => addedLr.trackingId === b.trackingId);
            if (wasAdded) {
                addHistoryLog(b.lrNo, 'In Transit', companyProfile?.companyName || 'System', `Dispatched via Challan ${challanId}`);
                return { ...b, status: 'In Transit' as const };
            }
            return b;
        });
        saveBookings(updatedBookings);
        
        toast({ title: "Challan Finalized", description: `Challan ${challanId} has been created and LRs are now In Transit.` });
        
        // Reset form
        setAddedLrs([]);
        setInStockLrs(allBookings.filter(b => b.status === 'In Stock' && !addedLrs.some(alr => alr.trackingId === b.trackingId)));
        setChallanId(`CHLN-${Date.now()}`);
        setVehicleNo(undefined);
        setDriverName(undefined);
        setToStation(null);
    };

    const vehicleOptions = useMemo(() => vehicles.map(v => ({ label: v.vehicleNo, value: v.vehicleNo })), [vehicles]);
    const driverOptions = useMemo(() => drivers.map(d => ({ label: d.name, value: d.name })), [drivers]);
    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);

    const renderTable = (title: string, data: Booking[], selection: Set<string>, onSelect: (id: string, checked: boolean) => void, onSelectAll: (checked: boolean) => void) => (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-3">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <div className="overflow-y-auto h-96 border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10 sticky top-0 bg-card"><Checkbox onCheckedChange={(c) => onSelectAll(c as boolean)} checked={data.length > 0 && selection.size === data.length} /></TableHead>
                                <TableHead className="sticky top-0 bg-card">LR No</TableHead>
                                <TableHead className="sticky top-0 bg-card">To</TableHead>
                                <TableHead className="sticky top-0 bg-card">Packages</TableHead>
                                <TableHead className="sticky top-0 bg-card">Charge Wt.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(lr => (
                                <TableRow key={lr.trackingId}>
                                    <TableCell><Checkbox onCheckedChange={(c) => onSelect(lr.trackingId, c as boolean)} checked={selection.has(lr.trackingId)} /></TableCell>
                                    <TableCell>{lr.lrNo}</TableCell>
                                    <TableCell>{lr.toCity}</TableCell>
                                    <TableCell>{lr.qty}</TableCell>
                                    <TableCell>{lr.chgWt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    New Dispatch Challan
                </h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Challan Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                        <Label>Challan ID</Label>
                        <Input value={challanId} readOnly className="font-bold text-red-600 bg-red-50 border-red-200" />
                    </div>
                    <div className="space-y-1">
                        <Label>Dispatch Date</Label>
                        <DatePicker date={dispatchDate} setDate={setDispatchDate} />
                    </div>
                    <div className="space-y-1">
                        <Label>Vehicle No</Label>
                        <Combobox options={vehicleOptions} value={vehicleNo} onChange={setVehicleNo} placeholder="Select Vehicle..." />
                    </div>
                    <div className="space-y-1">
                        <Label>Driver Name</Label>
                        <Combobox options={driverOptions} value={driverName} onChange={setDriverName} placeholder="Select Driver..." />
                    </div>
                     <div className="space-y-1">
                        <Label>To Station</Label>
                        <Combobox options={cityOptions} value={toStation?.name} onChange={(val) => setToStation(cities.find(c => c.name === val) || null)} placeholder="Select Destination..." />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {renderTable('LRs In Stock', inStockLrs, stockSelection, (id, checked) => {
                    const newSelection = new Set(stockSelection);
                    if (checked) newSelection.add(id); else newSelection.delete(id);
                    setStockSelection(newSelection);
                }, (checked) => {
                    if (checked) setStockSelection(new Set(inStockLrs.map(lr => lr.trackingId))); else setStockSelection(new Set());
                })}

                <div className="flex flex-col gap-2">
                    <Button onClick={handleAddToChallan} disabled={stockSelection.size === 0}><ArrowDown className="mr-2 h-4 w-4" /> Add to Challan</Button>
                    <Button onClick={handleRemoveFromChallan} disabled={addedSelection.size === 0} variant="outline"><ArrowUp className="mr-2 h-4 w-4" /> Remove from Challan</Button>
                </div>

                {renderTable('LRs Added to Challan', addedLrs, addedSelection, (id, checked) => {
                    const newSelection = new Set(addedSelection);
                    if (checked) newSelection.add(id); else newSelection.delete(id);
                    setAddedSelection(newSelection);
                }, (checked) => {
                    if (checked) setAddedSelection(new Set(addedLrs.map(lr => lr.trackingId))); else setAddedSelection(new Set());
                })}
            </div>
            
            <div className="flex justify-end">
                <Button onClick={handleFinalizeChallan} size="lg"><Save className="mr-2 h-4 w-4" /> Finalize & Save Challan</Button>
            </div>
        </div>
    );
}


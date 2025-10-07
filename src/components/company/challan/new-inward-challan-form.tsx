
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Save, X, PlusCircle, Trash2, Search, ArrowRight } from 'lucide-react';
import type { Challan, LrDetail } from '@/lib/challan-data';
import { getChallanData, saveChallanData, getLrDetailsData, saveLrDetailsData } from '@/lib/challan-data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { addHistoryLog } from '@/lib/history-data';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookingForm } from '../bookings/booking-form';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NewInwardChallanForm() {
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [allDispatchChallans, setAllDispatchChallans] = useState<Challan[]>([]);
    
    // Inward details
    const [inwardChallanId, setInwardChallanId] = useState('');
    const [inwardDate, setInwardDate] = useState<Date | undefined>(new Date());
    const [receivedFrom, setReceivedFrom] = useState('');
    const [originalChallanNo, setOriginalChallanNo] = useState('');
    const [originalChallanDate, setOriginalChallanDate] = useState<Date | undefined>(new Date());
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [fromStation, setFromStation] = useState('');
    
    // Manual LR state
    const [manualLrs, setManualLrs] = useState<Booking[]>([]);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    
    // Import from System
    const [importQuery, setImportQuery] = useState('');
    const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
    const [selectedChallanLrs, setSelectedChallanLrs] = useState<LrDetail[]>([]);

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            const allChallans = getChallanData();
            setAllDispatchChallans(allChallans.filter(c => c.challanType === 'Dispatch' && c.status === 'Finalized'));
            
            const nextId = (allChallans.filter(c => c.challanType === 'Inward').length) + 1;
            setInwardChallanId(`INW-${String(nextId).padStart(4, '0')}`);
        }
        loadData();
    }, []);

    const handleSearchChallan = () => {
        const found = allDispatchChallans.find(c => c.challanId.toLowerCase() === importQuery.toLowerCase());
        if (found) {
            setSelectedChallan(found);
            const lrs = getLrDetailsData().filter(lr => lr.challanId === found.challanId);
            setSelectedChallanLrs(lrs);
            // Pre-fill fields from the dispatch challan
            setReceivedFrom(found.fromStation);
            setOriginalChallanNo(found.challanId);
            setOriginalChallanDate(new Date(found.dispatchDate));
            setVehicleNo(found.vehicleNo);
            setDriverName(found.driverName);
            setFromStation(found.fromStation);
        } else {
            toast({ title: 'Not Found', description: 'Dispatch challan not found.', variant: 'destructive' });
            setSelectedChallan(null);
            setSelectedChallanLrs([]);
        }
    };
    
    const handleAddManualBooking = (bookingData: Booking) => {
        setManualLrs(prev => [...prev, bookingData]);
        setIsBookingFormOpen(false);
        toast({ title: 'LR Added', description: `LR No. ${bookingData.lrNo} has been added to the inward challan.`});
    }

    const handleSaveInwardChallan = (mode: 'manual' | 'import') => {
        const toStation = companyProfile?.city || 'N/A';
        
        let lrsToSave: LrDetail[] = [];
        let bookingsToUpdate: Booking[] = [];

        if (mode === 'manual') {
            if (manualLrs.length === 0) {
                 toast({ title: 'Error', description: 'Please add at least one LR manually.', variant: 'destructive' });
                 return;
            }
            // In manual mode, we create new bookings and their corresponding LR details
            const allBookings = getBookings();
            manualLrs.forEach(b => {
                 const newBooking: Booking = { ...b, status: 'In Stock', trackingId: `TRK-${Date.now()}-${Math.random()}` };
                 bookingsToUpdate.push(newBooking);
                 lrsToSave.push({
                     challanId: inwardChallanId, lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver, from: b.fromCity, to: b.toCity, bookingDate: b.bookingDate, itemDescription: b.itemDescription, quantity: b.qty, actualWeight: b.itemRows.reduce((s,i) => s + Number(i.actWt), 0), chargeWeight: b.chgWt, grandTotal: b.totalAmount
                 });
            });
            saveBookings([...allBookings, ...bookingsToUpdate]);

        } else if (mode === 'import' && selectedChallan) {
             if (selectedChallanLrs.length === 0) {
                 toast({ title: 'Error', description: 'No LRs to import from the selected challan.', variant: 'destructive' });
                 return;
            }
            lrsToSave = selectedChallanLrs.map(lr => ({...lr, challanId: inwardChallanId, from: fromStation, to: toStation }));
        }

        if (lrsToSave.length === 0) {
            toast({ title: 'Error', description: 'No LRs to process.', variant: 'destructive' });
            return;
        }

        const newInwardChallan: Challan = {
            challanId: inwardChallanId,
            challanType: 'Inward',
            dispatchDate: format(inwardDate!, 'yyyy-MM-dd'),
            inwardDate: format(inwardDate!, 'yyyy-MM-dd'),
            status: 'Finalized',
            vehicleNo,
            driverName,
            fromStation,
            toStation,
            totalLr: lrsToSave.length,
            totalPackages: lrsToSave.reduce((sum, lr) => sum + lr.quantity, 0),
            totalChargeWeight: lrsToSave.reduce((sum, lr) => sum + lr.chargeWeight, 0),
            receivedFromParty: receivedFrom,
            dispatchToParty: '', totalItems: 0, totalActualWeight: 0, vehicleHireFreight: 0, advance: 0, balance: 0, senderId: '', inwardId: '', summary: { grandTotal: 0, totalTopayAmount: 0, commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0 }
        };
        
        const allChallans = getChallanData();
        saveChallanData([...allChallans, newInwardChallan]);
        
        const allLrDetails = getLrDetailsData();
        saveLrDetailsData([...allLrDetails, ...lrsToSave]);

        if (mode === 'import') {
            const lrNumbers = new Set(lrsToSave.map(lr => lr.lrNo));
            const allBookings = getBookings();
            const updatedBookings = allBookings.map(b => {
                if (lrNumbers.has(b.lrNo)) {
                    addHistoryLog(b.lrNo, 'In Stock', 'System', `Arrived at ${toStation} via Inward Challan ${inwardChallanId}`);
                    return { ...b, status: 'In Stock' as const };
                }
                return b;
            });
            saveBookings(updatedBookings);
        }

        toast({ title: 'Success', description: `Inward Challan ${inwardChallanId} has been created.` });
        router.push('/company/challan');
    };

    return (
      <div className="space-y-4">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-8 w-8" />
                New Inward Challan
            </h1>
        </header>

        <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="import">Import from System</TabsTrigger>
            </TabsList>
            
            {/* Manual Entry Tab */}
            <TabsContent value="manual">
                <Card>
                    <CardHeader><CardTitle>Manual Inward Entry</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <Label>Inward Challan ID</Label>
                                <Input value={inwardChallanId} readOnly className="font-bold bg-muted" />
                            </div>
                             <div className="space-y-1">
                                <Label>Inward Date</Label>
                                <DatePicker date={inwardDate} setDate={setInwardDate} />
                            </div>
                             <div className="space-y-1">
                                <Label>Received From</Label>
                                <Input value={receivedFrom} onChange={(e) => setReceivedFrom(e.target.value)} placeholder="Party / Branch Name"/>
                            </div>
                             <div className="space-y-1">
                                <Label>Vehicle No.</Label>
                                <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
                            </div>
                             <div className="space-y-1">
                                <Label>Manual/External Challan No.</Label>
                                <Input value={originalChallanNo} onChange={(e) => setOriginalChallanNo(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Original Challan Date</Label>
                                <DatePicker date={originalChallanDate} setDate={setOriginalChallanDate} />
                            </div>
                             <div className="space-y-1">
                                <Label>From Station</Label>
                                <Input value={fromStation} onChange={(e) => setFromStation(e.target.value)} />
                            </div>
                        </div>
                        
                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Goods Details (Manual)</h3>
                                <Button type="button" onClick={() => setIsBookingFormOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4"/>Add LR Manually
                                </Button>
                            </div>
                             <div className="overflow-x-auto border rounded-md min-h-48">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>LR No</TableHead>
                                            <TableHead>Consignor</TableHead>
                                            <TableHead>Consignee</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                         {manualLrs.length > 0 ? (
                                            manualLrs.map((lr) => (
                                                <TableRow key={lr.lrNo}>
                                                    <TableCell>{lr.lrNo}</TableCell>
                                                    <TableCell>{lr.sender}</TableCell>
                                                    <TableCell>{lr.receiver}</TableCell>
                                                    <TableCell>{lr.qty}</TableCell>
                                                    <TableCell>{lr.chgWt}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setManualLrs(prev => prev.filter(item => item.lrNo !== lr.lrNo))}>
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                         ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    No LRs added yet. Click "Add LR Manually" to start.
                                                </TableCell>
                                            </TableRow>
                                         )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="destructive" type="button" onClick={() => router.push('/company/challan')}><X className="mr-2 h-4 w-4"/>Cancel</Button>
                            <Button onClick={() => handleSaveInwardChallan('manual')}><Save className="mr-2 h-4 w-4"/>Save Inward Challan</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import">
                <Card>
                    <CardHeader><CardTitle>Import from Dispatch Challan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input value={importQuery} onChange={e => setImportQuery(e.target.value)} placeholder="Enter Dispatch Challan ID to import..." />
                            <Button onClick={handleSearchChallan}><Search className="mr-2 h-4 w-4"/>Search</Button>
                        </div>
                        
                        {selectedChallan && (
                            <div className="p-4 border rounded-md bg-muted/50 space-y-4">
                                <h3 className="font-semibold text-lg">Dispatch Details</h3>
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                    <p><span className="font-medium">From:</span> {selectedChallan.fromStation}</p>
                                    <p><span className="font-medium">To:</span> {selectedChallan.toStation}</p>
                                    <p><span className="font-medium">Vehicle:</span> {selectedChallan.vehicleNo}</p>
                                    <p><span className="font-medium">Date:</span> {selectedChallan.dispatchDate}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">LRs in this Challan ({selectedChallanLrs.length})</h4>
                                    <div className="overflow-auto border rounded-md max-h-60">
                                         <Table>
                                            <TableHeader><TableRow><TableHead>LR No</TableHead><TableHead>To</TableHead><TableHead>Receiver</TableHead><TableHead>Qty</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {selectedChallanLrs.map(lr => (
                                                    <TableRow key={lr.lrNo}>
                                                        <TableCell>{lr.lrNo}</TableCell>
                                                        <TableCell>{lr.to}</TableCell>
                                                        <TableCell>{lr.receiver}</TableCell>
                                                        <TableCell>{lr.quantity}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                 <div className="flex justify-center pt-4">
                                    <Button onClick={() => handleSaveInwardChallan('import')} size="lg">
                                        Confirm & Receive these Items
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        <Dialog open={isBookingFormOpen} onOpenChange={setIsBookingFormOpen}>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Manual LR Details</DialogTitle>
                    <DialogDescription>
                        Fill out the booking details for the externally received LR. This will create a new booking in your system.
                    </DialogDescription>
                </DialogHeader>
                 <ScrollArea className="flex-grow">
                    <div className="pr-6">
                        <BookingForm
                            isOfflineMode={true}
                            onSaveSuccess={(booking) => handleAddManualBooking(booking)}
                            onClose={() => setIsBookingFormOpen(false)}
                        />
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      </div>
    );
}

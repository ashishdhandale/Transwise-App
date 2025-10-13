

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import type { City } from '@/lib/types';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCities } from '@/lib/city-data';
import { Textarea } from '@/components/ui/textarea';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ArrowDown, FileText, Loader2, Save, Trash2, X, PlusCircle, Pencil, RefreshCcw, XCircle } from 'lucide-react';
import { BookingForm } from '../bookings/booking-form';
import { Separator } from '@/components/ui/separator';
import { ClientOnly } from '@/components/ui/client-only';

const inwardChallanSchema = z.object({
  inwardId: z.string(),
  inwardDate: z.date(),
  originalChallanNo: z.string().optional(),
  receivedFromParty: z.string().min(1, 'Received from is required'),
  vehicleNo: z.string().min(1, 'Vehicle number is required'),
  driverName: z.string().optional(),
  fromStation: z.string().min(1, 'From station is required'),
  remarks: z.string().optional(),
});

type InwardChallanFormValues = z.infer<typeof inwardChallanSchema>;

const generateInwardChallanId = (challans: Challan[]): string => {
    const prefix = 'INW-';
    const relevantIds = challans.map(c => c.inwardId).filter(id => id && id.startsWith(prefix));
    if (relevantIds.length === 0) return `${prefix}01`;
    const lastNum = relevantIds.map(id => parseInt(id.substring(prefix.length), 10)).filter(n => !isNaN(n)).reduce((max, current) => Math.max(max, current), 0);
    return `${prefix}${String(lastNum + 1).padStart(2, '0')}`;
};

export function NewInwardChallanForm() {
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    const [showLrForm, setShowLrForm] = useState(false);
    const [editingLr, setEditingLr] = useState<Booking | null>(null);
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<InwardChallanFormValues>({
        resolver: zodResolver(inwardChallanSchema),
        defaultValues: { 
            inwardId: '', 
            inwardDate: undefined,
            originalChallanNo: '',
            receivedFromParty: '',
            vehicleNo: '',
            driverName: '',
            fromStation: '',
            remarks: ''
        }
    });

    useEffect(() => {
        async function loadInitialData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            const allCities = getCities();
            setCities(allCities);
            const allChallans = getChallanData();
            
            const existingChallanId = searchParams.get('challanId');
            if (existingChallanId) {
                const challan = allChallans.find(c => c.challanId === existingChallanId);
                if (challan) {
                    form.reset({
                        inwardId: challan.inwardId,
                        inwardDate: challan.inwardDate ? new Date(challan.inwardDate) : new Date(),
                        originalChallanNo: challan.originalChallanNo,
                        receivedFromParty: challan.receivedFromParty,
                        vehicleNo: challan.vehicleNo,
                        driverName: challan.driverName,
                        fromStation: challan.fromStation,
                        remarks: challan.remark
                    });
                    
                    const lrDetailsForChallan = getLrDetailsData().filter(lr => lr.challanId === existingChallanId);
                    
                    const reconstructedBookings: Booking[] = lrDetailsForChallan.map(lr => {
                        return {
                            trackingId: `temp-${lr.lrNo}-${Math.random()}`, // Ensure unique key
                            lrNo: lr.lrNo,
                            lrType: lr.lrType as any,
                            bookingDate: lr.bookingDate,
                            fromCity: lr.from,
                            toCity: lr.to,
                            sender: lr.sender,
                            receiver: lr.receiver,
                            itemDescription: lr.itemDescription,
                            qty: lr.quantity,
                            chgWt: lr.chargeWeight,
                            totalAmount: lr.grandTotal,
                            itemRows: [{ // Create a dummy item row for consistency
                                id: Date.now(),
                                ewbNo: '',
                                itemName: lr.itemDescription,
                                description: '',
                                wtPerUnit: '',
                                qty: String(lr.quantity),
                                actWt: String(lr.actualWeight),
                                chgWt: String(lr.chargeWeight),
                                rate: '',
                                freightOn: 'Fixed',
                                lumpsum: String(lr.grandTotal),
                                pvtMark: '',
                                invoiceNo: '',
                                dValue: '',
                            }], 
                            status: 'In Stock'
                        }
                    });
                    setAddedLrs(reconstructedBookings);
                }
            } else {
                 const newId = generateInwardChallanId(allChallans);
                 form.setValue('inwardId', newId);
                 form.setValue('inwardDate', new Date());
            }
        }
        loadInitialData();
    }, [searchParams, form]);
    
    const handleAddLr = (newBooking: Booking) => {
        if(editingLr) {
             setAddedLrs(prev => prev.map(lr => lr.trackingId === editingLr.trackingId ? {...newBooking, trackingId: editingLr.trackingId} : lr));
             toast({ title: 'LR Updated', description: `LR# ${newBooking.lrNo} has been updated.`});
        } else {
             if (addedLrs.some(lr => lr.lrNo.toLowerCase() === newBooking.lrNo.toLowerCase())) {
                toast({ title: 'Duplicate LR', description: 'This LR number has already been added to the list.', variant: 'destructive'});
                return;
            }
            const bookingWithId = {...newBooking, trackingId: `temp-${Date.now()}`};
            setAddedLrs(prev => [bookingWithId, ...prev]);
            toast({ title: 'LR Added', description: `LR# ${newBooking.lrNo} added to the inward challan.`});
        }
        
        setShowLrForm(false);
        setEditingLr(null);
    };

    const handleEditLr = (lrToEdit: Booking) => {
        setEditingLr(lrToEdit);
        setShowLrForm(true);
    };
    
    const handleRemoveLr = (trackingId: string) => {
        setAddedLrs(prev => prev.filter(lr => lr.trackingId !== trackingId));
    };

    const handleCancelForm = () => {
        setShowLrForm(false);
        setEditingLr(null);
    };

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);

    const buildChallanData = (status: 'Pending' | 'Finalized'): { challan: Challan, lrDetails: LrDetail[] } | null => {
        const formData = form.getValues();
        const existingChallanId = searchParams.get('challanId');
        const finalChallanId = existingChallanId || `CHLN-${Date.now()}`;

        const newChallanData: Challan = {
            challanId: finalChallanId,
            inwardId: formData.inwardId,
            inwardDate: formData.inwardDate.toISOString(),
            originalChallanNo: formData.originalChallanNo,
            receivedFromParty: formData.receivedFromParty,
            vehicleNo: formData.vehicleNo,
            driverName: formData.driverName || '',
            fromStation: formData.fromStation,
            toStation: companyProfile?.city || 'N/A',
            challanType: 'Inward',
            status: status,
            dispatchDate: formData.inwardDate.toISOString(),
            dispatchToParty: '',
            totalLr: addedLrs.length,
            totalPackages: addedLrs.reduce((sum, b) => sum + b.qty, 0),
            totalItems: addedLrs.reduce((sum, b) => sum + (b.itemRows?.length || 0), 0),
            totalActualWeight: addedLrs.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
            totalChargeWeight: addedLrs.reduce((sum, b) => sum + b.chgWt, 0),
            vehicleHireFreight: 0, advance: 0, balance: 0, senderId: '',
            remark: formData.remarks,
            summary: { grandTotal: 0, totalTopayAmount: 0, commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0 },
        };
        
        const newLrDetails: LrDetail[] = addedLrs.map(b => ({
            challanId: finalChallanId, lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: b.bookingDate, itemDescription: b.itemDescription,
            quantity: b.qty, actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
            chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));

        return { challan: newChallanData, lrDetails: newLrDetails };
    };

    const handleSaveTemp = () => {
        const data = buildChallanData('Pending');
        if (!data) return;

        const { challan, lrDetails } = data;
        let allChallans = getChallanData();
        const existingChallanId = searchParams.get('challanId');
        
        if (existingChallanId) {
            allChallans = allChallans.map(c => c.challanId === existingChallanId ? challan : c);
        } else {
            allChallans.push(challan);
        }
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== challan.challanId);
        allLrDetails.push(...lrDetails);
        saveLrDetailsData(allLrDetails);

        toast({ title: 'Inward Challan Saved', description: `Challan ${challan.inwardId} has been saved as pending.` });
        router.push('/company/challan');
    };

    const onSubmit = (data: InwardChallanFormValues) => {
        if (addedLrs.length === 0) {
            toast({ title: 'No LRs', description: 'Please add at least one LR to create an inward challan.', variant: 'destructive' });
            return;
        }
        
        const challanData = buildChallanData('Finalized');
        if (!challanData) return;

        const { challan, lrDetails } = challanData;
        
        let allChallans = getChallanData();
        const existingChallanId = searchParams.get('challanId');

        if (existingChallanId) {
            allChallans = allChallans.map(c => c.challanId === existingChallanId ? challan : c);
        } else {
            allChallans.push(challan);
        }
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== challan.challanId);
        allLrDetails.push(...lrDetails);
        saveLrDetailsData(allLrDetails);

        const allBookings = getBookings();
        
        // Add all inward LRs to the main booking list with source 'Inward'
        const newBookingsToCreate = addedLrs.map(b => ({
            ...b,
            source: 'Inward' as const,
            status: 'In Stock' as const
        }));

        newBookingsToCreate.forEach(b => {
             addHistoryLog(b.lrNo, 'In Stock', 'System (Inward)', `Received via Inward Challan ${data.inwardId} at ${challan.toStation}.`);
        });
        
        const updatedBookings = [...allBookings, ...newBookingsToCreate];
        saveBookings(updatedBookings);

        toast({ title: 'Inward Challan Saved', description: `Successfully created Inward Challan ${data.inwardId}. ${newBookingsToCreate.length} new LRs added to stock.`});
        router.push('/company/challan');
    };

    const totals = useMemo(() => {
        return {
            lrCount: addedLrs.length,
            qty: addedLrs.reduce((sum, lr) => sum + lr.qty, 0),
            actWt: addedLrs.reduce((sum, lr) => sum + lr.itemRows.reduce((itemSum, i) => itemSum + Number(i.actWt), 0), 0),
            amount: addedLrs.reduce((sum, lr) => sum + lr.totalAmount, 0),
        }
    }, [addedLrs]);

    return (
         <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    {searchParams.get('challanId') ? 'Edit Inward Challan' : 'New Inward Challan'}
                </h1>
            </header>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <FormField name="inwardId" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Inward ID</FormLabel><FormControl><Input {...field} readOnly className="font-bold text-red-600 bg-red-50"/></FormControl></FormItem>
                            )}/>
                            <FormField name="inwardDate" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Inward Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl></FormItem>
                            )}/>
                            <FormField name="receivedFromParty" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Received From Party</FormLabel><FormControl><Input placeholder="e.g. Origin Branch Name" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="originalChallanNo" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Original Challan No</FormLabel><FormControl><Input placeholder="Original Challan No" {...field} /></FormControl></FormItem>
                            )}/>
                             <FormField name="vehicleNo" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Vehicle No.</FormLabel><FormControl><Input placeholder="e.g. MH31CQ1234" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="driverName" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Driver Name</FormLabel><FormControl><Input placeholder="Driver Name" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField name="fromStation" control={form.control} render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>From Station</FormLabel>
                                    <Combobox options={cityOptions} value={field.value} onChange={field.onChange} placeholder="Select Origin..." />
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    {showLrForm ? (
                        <>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-primary">{editingLr ? `Editing LR: ${editingLr.lrNo}` : 'Add New LR Details'}</h2>
                            <Button type="button" variant="outline" size="sm" onClick={handleCancelForm}>
                                <XCircle className="mr-2 h-4 w-4" /> {editingLr ? 'Cancel Edit' : 'Close Form'}
                            </Button>
                          </div>
                          <BookingForm
                            bookingId={editingLr?.trackingId}
                            bookingData={editingLr}
                            isOfflineMode={true}
                            onSaveSuccess={handleAddLr}
                            onClose={handleCancelForm}
                          />
                        </>
                    ) : (
                        <div className="text-center">
                            <Button type="button" size="lg" onClick={() => setShowLrForm(true)}>
                                <PlusCircle className="mr-2 h-5 w-5" /> Add LR Entry
                            </Button>
                        </div>
                    )}


                    <Card>
                        <CardHeader>
                            <CardTitle>LRs Received</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-y-auto border rounded-md min-h-48">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>LR No</TableHead>
                                            <TableHead>Sender</TableHead>
                                            <TableHead>Receiver</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Act. Wt.</TableHead>
                                            <TableHead>Booking Type</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addedLrs.map(lr => (
                                            <TableRow key={lr.trackingId}>
                                                <TableCell>{lr.lrNo}</TableCell>
                                                <TableCell>{lr.sender}</TableCell>
                                                <TableCell>{lr.receiver}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">{lr.itemDescription}</TableCell>
                                                <TableCell>{lr.qty}</TableCell>
                                                <TableCell>{lr.itemRows.reduce((sum, item) => sum + Number(item.actWt || 0), 0).toFixed(2)}</TableCell>
                                                <TableCell>{lr.lrType}</TableCell>
                                                <TableCell>{lr.totalAmount.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditLr(lr)}><Pencil className="h-4 w-4 text-blue-600"/></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveLr(lr.trackingId)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {addedLrs.length === 0 && (
                                            <TableRow><TableCell colSpan={9} className="text-center h-24 text-muted-foreground">No LRs added yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                    {addedLrs.length > 0 && (
                                        <TableFooter>
                                            <TableRow className="font-bold bg-muted/50">
                                                <TableCell colSpan={4}>Total LRs: {totals.lrCount}</TableCell>
                                                <TableCell>{totals.qty}</TableCell>
                                                <TableCell>{totals.actWt.toFixed(2)}</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell>{totals.amount.toFixed(2)}</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    )}
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {!showLrForm && (
                        <>
                        <Card>
                            <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
                            <CardContent>
                                <FormField name="remarks" control={form.control} render={({ field }) => (
                                    <FormItem><Textarea placeholder="Note any damages, shortages, or other remarks..." {...field} /></FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2">
                             <Button type="button" variant="destructive" onClick={() => router.push('/company/challan')}><X className="mr-2 h-4 w-4"/> Cancel & Exit</Button>
                             <Button type="button" variant="outline" onClick={handleSaveTemp}><Save className="mr-2 h-4 w-4" /> Save as Temp & Exit</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                Finalize & Save Inward
                            </Button>
                        </div>
                        </>
                    )}
                </form>
            </Form>
        </div>
    );
}

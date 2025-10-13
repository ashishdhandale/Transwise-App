
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import type { City, Customer } from '@/lib/types';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCities } from '@/lib/city-data';
import { getCustomers } from '@/lib/customer-data';
import { Textarea } from '@/components/ui/textarea';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { FileText, Loader2, Save, Trash2, X, PlusCircle, Pencil, RefreshCcw } from 'lucide-react';
import { bookingOptions } from '@/lib/booking-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

// Schema for a single LR entry
const lrEntrySchema = z.object({
    lrNo: z.string().min(1, "LR No is required"),
    fromCity: z.string().min(1, "From is required"),
    toCity: z.string().min(1, "To is required"),
    sender: z.string().min(1, "Sender is required"),
    receiver: z.string().min(1, "Receiver is required"),
    itemDescription: z.string().min(1, "Item is required"),
    qty: z.coerce.number().min(1, "Qty must be > 0"),
    actWt: z.coerce.number().min(0.1, "Weight must be > 0"),
    lrType: z.enum(['FOC', 'PAID', 'TOPAY', 'TBB']),
    totalAmount: z.coerce.number().min(0)
});
type LrEntryFormValues = z.infer<typeof lrEntrySchema>;


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
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    const [editingLrTrackingId, setEditingLrTrackingId] = useState<string | null>(null);
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Main form for challan details
    const challanForm = useForm<InwardChallanFormValues>({
        resolver: zodResolver(inwardChallanSchema),
        defaultValues: { 
            inwardId: '', inwardDate: undefined, originalChallanNo: '', receivedFromParty: '', vehicleNo: '', driverName: '', fromStation: '', remarks: ''
        }
    });

    // Separate form for the LR entry line
    const lrEntryForm = useForm<LrEntryFormValues>({
        resolver: zodResolver(lrEntrySchema),
        defaultValues: {
            lrNo: '', fromCity: '', toCity: '', sender: '', receiver: '', itemDescription: '', qty: 0, actWt: 0, lrType: 'TOPAY', totalAmount: 0
        }
    });

    useEffect(() => {
        async function loadInitialData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            const allCities = getCities();
            setCities(allCities);
            setCustomers(getCustomers());
            const allChallans = getChallanData();
            
            const existingChallanId = searchParams.get('challanId');
            if (existingChallanId) {
                const challan = allChallans.find(c => c.challanId === existingChallanId);
                if (challan) {
                    challanForm.reset({
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
                    
                    const reconstructedBookings: Booking[] = lrDetailsForChallan.map(lr => ({
                        trackingId: `temp-${lr.lrNo}-${Math.random()}`,
                        lrNo: lr.lrNo, lrType: lr.lrType as any, bookingDate: lr.bookingDate,
                        fromCity: lr.from, toCity: lr.to, sender: lr.sender, receiver: lr.receiver,
                        itemDescription: lr.itemDescription, qty: lr.quantity, chgWt: lr.chargeWeight,
                        totalAmount: lr.grandTotal,
                        itemRows: [{ 
                            id: Date.now(), ewbNo: '', itemName: lr.itemDescription, description: '', wtPerUnit: '',
                            qty: String(lr.quantity), actWt: String(lr.actualWeight), chgWt: String(lr.chargeWeight),
                            rate: '', freightOn: 'Fixed', lumpsum: String(lr.grandTotal),
                            pvtMark: '', invoiceNo: '', dValue: '',
                        }], 
                        status: 'In Stock'
                    }));
                    setAddedLrs(reconstructedBookings);
                }
            } else {
                 const newId = generateInwardChallanId(allChallans);
                 challanForm.setValue('inwardId', newId);
                 challanForm.setValue('inwardDate', new Date());
            }
        }
        loadInitialData();
    }, [searchParams, challanForm]);
    
    const handleEditLr = (lrToEdit: Booking) => {
        setEditingLrTrackingId(lrToEdit.trackingId);
        lrEntryForm.reset({
            lrNo: lrToEdit.lrNo,
            fromCity: lrToEdit.fromCity,
            toCity: lrToEdit.toCity,
            sender: lrToEdit.sender,
            receiver: lrToEdit.receiver,
            itemDescription: lrToEdit.itemDescription,
            qty: lrToEdit.qty,
            actWt: lrToEdit.itemRows[0]?.actWt ? Number(lrToEdit.itemRows[0].actWt) : 0,
            lrType: lrToEdit.lrType,
            totalAmount: lrToEdit.totalAmount,
        });
    };

    const handleAddOrUpdateLr = (data: LrEntryFormValues) => {
        const newBooking: Booking = {
            trackingId: editingLrTrackingId || `temp-${Date.now()}`,
            lrNo: data.lrNo, lrType: data.lrType, bookingDate: challanForm.getValues('inwardDate').toISOString(),
            fromCity: data.fromCity, toCity: data.toCity, sender: data.sender, receiver: data.receiver,
            itemDescription: data.itemDescription, qty: data.qty, chgWt: data.actWt, totalAmount: data.totalAmount,
            itemRows: [{
                id: 1, qty: String(data.qty), actWt: String(data.actWt), chgWt: String(data.actWt), lumpsum: String(data.totalAmount),
                ewbNo: '', itemName: data.itemDescription, description: '', wtPerUnit: '', rate: '', freightOn: 'Fixed', pvtMark: '', invoiceNo: '', dValue: ''
            }],
            status: 'In Stock'
        };

        if (editingLrTrackingId) {
            setAddedLrs(prev => prev.map(lr => lr.trackingId === editingLrTrackingId ? newBooking : lr));
            toast({ title: 'LR Updated', description: `LR #${data.lrNo} has been updated in the list.` });
        } else {
            setAddedLrs(prev => [...prev, newBooking]);
        }
        setEditingLrTrackingId(null);
        lrEntryForm.reset({
            lrNo: '', fromCity: '', toCity: '', sender: '', receiver: '', itemDescription: '', qty: 0, actWt: 0, lrType: 'TOPAY', totalAmount: 0
        });
    };
    
    const handleRemoveLr = (trackingId: string) => {
        setAddedLrs(prev => prev.filter(lr => lr.trackingId !== trackingId));
    };

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);
    const customerOptions = useMemo(() => customers.map(c => ({ label: c.name, value: c.name })), [customers]);

    const onSubmit = (data: InwardChallanFormValues) => {
        if (addedLrs.length === 0) {
            toast({ title: 'No LRs', description: 'Please add at least one LR to create an inward challan.', variant: 'destructive' });
            return;
        }

        const existingChallanId = searchParams.get('challanId');
        const finalChallanId = existingChallanId || `CHLN-${Date.now()}`;
        
        const newChallanData: Challan = {
            challanId: finalChallanId, inwardId: data.inwardId, inwardDate: data.inwardDate.toISOString(),
            originalChallanNo: data.originalChallanNo, receivedFromParty: data.receivedFromParty, vehicleNo: data.vehicleNo,
            driverName: data.driverName || '', fromStation: data.fromStation, toStation: companyProfile?.city || 'N/A',
            challanType: 'Inward', status: 'Finalized', dispatchDate: data.inwardDate.toISOString(), dispatchToParty: '',
            totalLr: addedLrs.length, totalPackages: addedLrs.reduce((s, b) => s + b.qty, 0), totalItems: addedLrs.length,
            totalActualWeight: addedLrs.reduce((s, b) => s + b.itemRows.reduce((is, i) => is + Number(i.actWt), 0), 0),
            totalChargeWeight: addedLrs.reduce((s, b) => s + b.chgWt, 0),
            vehicleHireFreight: 0, advance: 0, balance: 0, senderId: '', remark: data.remarks,
            summary: { grandTotal: 0, totalTopayAmount: 0, commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0 },
        };
        
        const newLrDetails: LrDetail[] = addedLrs.map(b => ({
            challanId: finalChallanId, lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: b.bookingDate, itemDescription: b.itemDescription,
            quantity: b.qty, actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
            chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));
        
        let allChallans = getChallanData();
        if (existingChallanId) {
            allChallans = allChallans.map(c => c.challanId === existingChallanId ? newChallanData : c);
        } else {
            allChallans.push(newChallanData);
        }
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== newChallanData.challanId);
        allLrDetails.push(...newLrDetails);
        saveLrDetailsData(allLrDetails);
        
        const newBookingsToStock = addedLrs.map(b => ({
            ...b, source: 'Inward' as const, status: 'In Stock' as const
        }));
        newBookingsToStock.forEach(b => {
             addHistoryLog(b.lrNo, 'In Stock', 'System (Inward)', `Received via Inward Challan ${data.inwardId} at ${newChallanData.toStation}.`);
        });
        const allBookings = getBookings();
        const updatedBookings = [...allBookings, ...newBookingsToStock];
        saveBookings(updatedBookings);

        toast({ title: 'Inward Challan Saved', description: `Successfully created Inward Challan ${data.inwardId}. ${newBookingsToStock.length} new LRs added to stock.`});
        router.push('/company/challan');
    };

    const totals = useMemo(() => {
        return {
            lrCount: addedLrs.length, qty: addedLrs.reduce((sum, lr) => sum + lr.qty, 0),
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
            <Form {...challanForm}>
                <form onSubmit={challanForm.handleSubmit(onSubmit)} className="space-y-4">
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <FormField name="inwardId" control={challanForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Inward ID</FormLabel><FormControl><Input {...field} readOnly className="font-bold text-red-600 bg-red-50"/></FormControl></FormItem>
                            )}/>
                            <FormField name="inwardDate" control={challanForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Inward Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl></FormItem>
                            )}/>
                            <FormField name="receivedFromParty" control={challanForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Received From Party</FormLabel><FormControl><Input placeholder="e.g. Origin Branch Name" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="originalChallanNo" control={challanForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Original Challan No</FormLabel><FormControl><Input placeholder="Original Challan No" {...field} /></FormControl></FormItem>
                            )}/>
                             <FormField name="vehicleNo" control={challanForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Vehicle No.</FormLabel><FormControl><Input placeholder="e.g. MH31CQ1234" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="driverName" control={challanForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Driver Name</FormLabel><FormControl><Input placeholder="Driver Name" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField name="fromStation" control={challanForm.control} render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>From Station</FormLabel>
                                    <Combobox options={cityOptions} value={field.value} onChange={field.onChange} placeholder="Select Origin..." />
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Add LR Entry</CardTitle></CardHeader>
                        <CardContent>
                            <Form {...lrEntryForm}>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 items-end">
                                    <FormField name="lrNo" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>LR No.*</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>} />
                                    <FormField name="fromCity" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>From*</FormLabel><FormControl><Combobox options={cityOptions} {...field} placeholder="Select..."/></FormControl></FormItem>} />
                                    <FormField name="toCity" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>To*</FormLabel><FormControl><Combobox options={cityOptions} {...field} placeholder="Select..."/></FormControl></FormItem>} />
                                    <FormField name="sender" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>Sender*</FormLabel><FormControl><Combobox options={customerOptions} {...field} placeholder="Select..."/></FormControl></FormItem>} />
                                    <FormField name="receiver" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>Receiver*</FormLabel><FormControl><Combobox options={customerOptions} {...field} placeholder="Select..."/></FormControl></FormItem>} />
                                    <FormField name="itemDescription" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>Item*</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>} />
                                    <FormField name="qty" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>Qty*</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>} />
                                    <FormField name="actWt" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>Act. Wt.*</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>} />
                                    <FormField name="lrType" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>LR Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{bookingOptions.bookingTypes.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></FormItem>} />
                                    <FormField name="totalAmount" control={lrEntryForm.control} render={({field}) => <FormItem><FormLabel>Total</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>} />
                                    <div className="flex items-center gap-2 pt-6">
                                        <Button type="button" onClick={lrEntryForm.handleSubmit(handleAddOrUpdateLr)} size="icon">
                                            {editingLrTrackingId ? <RefreshCcw className="h-4 w-4"/> : <PlusCircle className="h-4 w-4"/>}
                                        </Button>
                                        {editingLrTrackingId && <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingLrTrackingId(null); lrEntryForm.reset(); }}><X className="h-4 w-4"/></Button>}
                                    </div>
                                </div>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>LRs Received</CardTitle></CardHeader>
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
                    
                    <Card>
                        <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
                        <CardContent>
                            <FormField name="remarks" control={challanForm.control} render={({ field }) => (
                                <FormItem><Textarea placeholder="Note any damages, shortages, or other remarks..." {...field} /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="destructive" onClick={() => router.push('/company/challan')}><X className="mr-2 h-4 w-4"/> Cancel & Exit</Button>
                        <Button type="submit" disabled={challanForm.formState.isSubmitting}>
                            {challanForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Finalize & Save Inward
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

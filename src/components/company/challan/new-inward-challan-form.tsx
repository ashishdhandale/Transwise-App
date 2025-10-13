
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Loader2, PlusCircle, Save, X, Pencil, Trash2 } from 'lucide-react';
import { EditInwardLrDialog } from './edit-inward-lr-dialog';

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
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    const [editingLr, setEditingLr] = useState<Booking | null>(null);
    const [isAddLrDialogOpen, setIsAddLrDialogOpen] = useState(false);
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<InwardChallanFormValues>({
        resolver: zodResolver(inwardChallanSchema),
        defaultValues: { 
            inwardId: '', inwardDate: undefined, originalChallanNo: '', receivedFromParty: '', vehicleNo: '', driverName: '', fromStation: '', remarks: ''
        }
    });

    useEffect(() => {
        async function loadInitialData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            setCities(getCities());
            setCustomers(getCustomers());
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
                 form.setValue('inwardId', newId);
                 form.setValue('inwardDate', new Date());
            }
        }
        loadInitialData();
    }, [searchParams, form]);
    
    const handleAddLr = () => {
        setEditingLr(null);
        setIsAddLrDialogOpen(true);
    };

    const handleEditLr = (lrToEdit: Booking) => {
        setEditingLr(lrToEdit);
        setIsAddLrDialogOpen(true);
    };

    const handleSaveLr = (booking: Booking) => {
        if (editingLr) {
            setAddedLrs(prevLrs => prevLrs.map(lr => lr.trackingId === editingLr.trackingId ? booking : lr));
            toast({ title: "LR Updated", description: "The LR details have been updated." });
        } else {
            setAddedLrs(prevLrs => [...prevLrs, { ...booking, trackingId: `temp-${Date.now()}` }]);
        }
        setIsAddLrDialogOpen(false);
        setEditingLr(null);
    };
    
    const handleRemoveLr = (trackingId: string) => {
        setAddedLrs(prevLrs => prevLrs.filter(lr => lr.trackingId !== trackingId));
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

        const existingLrNos = new Set(getBookings().map(b => b.lrNo));
        const trulyNewBookings = newBookingsToStock.filter(b => !existingLrNos.has(b.lrNo));

        if(trulyNewBookings.length > 0) {
            const allBookings = getBookings();
            const updatedBookings = [...allBookings, ...trulyNewBookings];
            saveBookings(updatedBookings);
            trulyNewBookings.forEach(b => {
                 addHistoryLog(b.lrNo, 'In Stock', 'System (Inward)', `Received via Inward Challan ${data.inwardId} at ${newChallanData.toStation}.`);
            });
        }
        
        toast({ title: 'Inward Challan Saved', description: `Successfully created Inward Challan ${data.inwardId}. ${trulyNewBookings.length} new LRs added to stock.`});
        router.push('/company/challan');
    };

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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>LRs Received</CardTitle>
                             <Button type="button" size="sm" onClick={handleAddLr}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add LR Entry
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto border rounded-md min-h-48">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>LR No</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Chg. Wt.</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addedLrs.map(lr => (
                                            <TableRow key={lr.trackingId}>
                                                <TableCell>{lr.lrNo}</TableCell>
                                                <TableCell>{lr.fromCity}</TableCell>
                                                <TableCell>{lr.toCity}</TableCell>
                                                <TableCell>{lr.qty}</TableCell>
                                                <TableCell>{lr.chgWt.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditLr(lr)}><Pencil className="h-4 w-4 text-blue-600"/></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveLr(lr.trackingId)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {addedLrs.length === 0 && (
                                            <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No LRs added yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    
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
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Finalize & Save Inward
                        </Button>
                    </div>
                </form>
            </Form>
            
            <EditInwardLrDialog
                isOpen={isAddLrDialogOpen}
                onOpenChange={setIsAddLrDialogOpen}
                bookingData={editingLr}
                onSaveSuccess={handleSaveLr}
            />
        </div>
    );
}

    
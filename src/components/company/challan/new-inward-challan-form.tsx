
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, FileText, Loader2, Save, Trash2, X, PlusCircle } from 'lucide-react';
import { BookingForm } from '../bookings/booking-form';
import { Separator } from '@/components/ui/separator';

const inwardChallanSchema = z.object({
  inwardId: z.string(),
  inwardDate: z.date(),
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
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<InwardChallanFormValues>({
        resolver: zodResolver(inwardChallanSchema),
        defaultValues: { inwardDate: new Date() }
    });

    useEffect(() => {
        async function loadInitialData() {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            const allCities = getCities();
            setCities(allCities);
            const allChallans = getChallanData();
            const allBookings = getBookings();
            const allLrDetails = getLrDetailsData();

            const existingChallanId = searchParams.get('challanId');
            if (existingChallanId) {
                const challan = allChallans.find(c => c.challanId === existingChallanId);
                if (challan) {
                    form.reset({
                        inwardId: challan.inwardId,
                        inwardDate: new Date(challan.inwardDate),
                        receivedFromParty: challan.receivedFromParty,
                        vehicleNo: challan.vehicleNo,
                        driverName: challan.driverName,
                        fromStation: challan.fromStation,
                        remarks: challan.remark
                    });
                    const lrsForChallan = allLrDetails.filter(lr => lr.challanId === existingChallanId).map(lr => lr.lrNo);
                    const bookingsForChallan = allBookings.filter(b => lrsForChallan.includes(b.lrNo));
                    setAddedLrs(bookingsForChallan);
                }
            } else {
                form.setValue('inwardId', generateInwardChallanId(allChallans));
            }
        }
        loadInitialData();
    }, [searchParams, form]);
    
    const handleAddLr = (newBooking: Booking) => {
        if (addedLrs.some(lr => lr.lrNo.toLowerCase() === newBooking.lrNo.toLowerCase())) {
            toast({ title: 'Duplicate LR', description: 'This LR number has already been added to the list.', variant: 'destructive'});
            return;
        }
        setAddedLrs(prev => [newBooking, ...prev]);
        setShowLrForm(false);
        toast({ title: 'LR Added', description: `LR# ${newBooking.lrNo} added to the inward challan.`});
    };
    
    const handleRemoveLr = (trackingId: string) => {
        setAddedLrs(prev => prev.filter(lr => lr.trackingId !== trackingId));
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

        // For temp save, we might not want to save LRs or bookings yet, or save them with a temp link.
        // For now, let's assume we save LR details to keep them associated.
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
        const newBookingsToCreate = addedLrs.filter(added => !allBookings.some(existing => existing.lrNo === added.lrNo));

        newBookingsToCreate.forEach(b => {
             addHistoryLog(b.lrNo, 'Booking Created', 'System (Inward)', `Manual entry from Inward Challan ${data.inwardId}.`);
             addHistoryLog(b.lrNo, 'In Stock', 'System (Inward)', `Received at ${challan.toStation}.`);
        });

        const updatedBookings = [...allBookings, ...newBookingsToCreate];
        saveBookings(updatedBookings);

        toast({ title: 'Inward Challan Saved', description: `Successfully created Inward Challan ${data.inwardId}`});
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
                             <FormField name="vehicleNo" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Vehicle No.</FormLabel><FormControl><Input placeholder="e.g. MH31CQ1234" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="driverName" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Driver Name</FormLabel><FormControl><Input placeholder="Driver Name" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField name="fromStation" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>From Station</FormLabel>
                                <Combobox options={cityOptions} value={field.value} onChange={field.onChange} placeholder="Select Origin..." />
                                <FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>LRs Received</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-y-auto border rounded-md min-h-48">
                                <Table>
                                    <TableHeader><TableRow><TableHead>LR No</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Qty</TableHead><TableHead>Chg.Wt.</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {addedLrs.map(lr => (
                                            <TableRow key={lr.trackingId}>
                                                <TableCell>{lr.lrNo}</TableCell>
                                                <TableCell>{lr.fromCity}</TableCell>
                                                <TableCell>{lr.toCity}</TableCell>
                                                <TableCell>{lr.qty}</TableCell>
                                                <TableCell>{lr.chgWt.toFixed(2)}</TableCell>
                                                <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveLr(lr.trackingId)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
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

                    {showLrForm ? (
                        <>
                          <Separator />
                          <h2 className="text-xl font-semibold text-primary">Add New LR Details</h2>
                          <BookingForm
                            isOfflineMode={true}
                            onSaveSuccess={handleAddLr}
                            onClose={() => setShowLrForm(false)}
                          />
                        </>
                    ) : (
                         <div className="text-center">
                            <Button type="button" size="lg" onClick={() => setShowLrForm(true)}>
                                <PlusCircle className="mr-2 h-5 w-5" /> Add LR Entry
                            </Button>
                        </div>
                    )}
                    
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

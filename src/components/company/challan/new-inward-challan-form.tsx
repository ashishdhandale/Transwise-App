'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { ArrowDown, FileText, Loader2, Save, Trash2, X } from 'lucide-react';

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
    const [lrSearch, setLrSearch] = useState('');
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
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

            const existingChallanId = searchParams.get('challanId');
            if (existingChallanId) {
                const challanToEdit = allChallans.find(c => c.challanId === existingChallanId);
                if (challanToEdit) {
                    form.reset({
                        inwardId: challanToEdit.inwardId,
                        inwardDate: new Date(challanToEdit.inwardDate),
                        receivedFromParty: challanToEdit.receivedFromParty,
                        vehicleNo: challanToEdit.vehicleNo,
                        driverName: challanToEdit.driverName,
                        fromStation: challanToEdit.fromStation,
                        remarks: challanToEdit.remarks,
                    });
                     const lrDetails = getLrDetailsData().filter(lr => lr.challanId === existingChallanId);
                     const addedBookingNos = new Set(lrDetails.map(lr => lr.lrNo));
                     const added = getBookings().filter(b => addedBookingNos.has(b.lrNo));
                     setAddedLrs(added);
                }
            } else {
                form.setValue('inwardId', generateInwardChallanId(allChallans));
            }
        }
        loadInitialData();
    }, [searchParams, form]);

    const handleAddLr = () => {
        if (!lrSearch.trim()) return;
        const allBookings = getBookings();
        const lrToAdd = allBookings.find(b => b.lrNo.toLowerCase() === lrSearch.toLowerCase());
        
        if (!lrToAdd) {
            toast({ title: 'LR Not Found', description: `Booking with LR No. "${lrSearch}" not found.`, variant: 'destructive' });
            return;
        }
        if (lrToAdd.status !== 'In Transit') {
            toast({ title: 'Invalid Status', description: `LR No. "${lrSearch}" has status "${lrToAdd.status}" and cannot be inwarded.`, variant: 'destructive' });
            return;
        }
        if (addedLrs.some(lr => lr.lrNo === lrSearch)) {
            toast({ title: 'Already Added', description: `LR No. "${lrSearch}" is already in the list.`, variant: 'destructive' });
            return;
        }
        setAddedLrs(prev => [lrToAdd, ...prev]);
        setLrSearch('');
    };
    
    const handleRemoveLr = (trackingId: string) => {
        setAddedLrs(prev => prev.filter(lr => lr.trackingId !== trackingId));
    };

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);

    const onSubmit = (data: InwardChallanFormValues) => {
        if (addedLrs.length === 0) {
            toast({ title: 'No LRs', description: 'Please add at least one LR to create an inward challan.', variant: 'destructive' });
            return;
        }
        
        const allChallans = getChallanData();
        const existingChallanId = searchParams.get('challanId');
        
        const finalChallanId = existingChallanId || `CHLN-${Date.now()}`;

        const newChallanData: Challan = {
            challanId: finalChallanId,
            inwardId: data.inwardId,
            inwardDate: data.inwardDate.toISOString(),
            receivedFromParty: data.receivedFromParty,
            vehicleNo: data.vehicleNo,
            driverName: data.driverName || '',
            fromStation: data.fromStation,
            toStation: companyProfile?.city || 'N/A',
            challanType: 'Inward',
            status: 'Finalized',
            dispatchDate: data.inwardDate.toISOString(),
            dispatchToParty: '',
            totalLr: addedLrs.length,
            totalPackages: addedLrs.reduce((sum, b) => sum + b.qty, 0),
            totalItems: addedLrs.reduce((sum, b) => sum + b.itemRows.length, 0),
            totalActualWeight: addedLrs.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
            totalChargeWeight: addedLrs.reduce((sum, b) => sum + b.chgWt, 0),
            vehicleHireFreight: 0,
            advance: 0,
            balance: 0,
            senderId: '',
            summary: { grandTotal: 0, totalTopayAmount: 0, commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0 },
        };
        
        let updatedChallans;
        if (existingChallanId) {
            updatedChallans = allChallans.map(c => c.challanId === existingChallanId ? newChallanData : c);
        } else {
            updatedChallans = [...allChallans, newChallanData];
        }
        saveChallanData(updatedChallans);

        // Update LR Details
        const newLrDetails: LrDetail[] = addedLrs.map(b => ({
            challanId: finalChallanId,
            lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: b.bookingDate, itemDescription: b.itemDescription,
            quantity: b.qty, actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
            chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));
        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== existingChallanId);
        allLrDetails.push(...newLrDetails);
        saveLrDetailsData(allLrDetails);


        // Update Booking Status
        const addedLrNos = new Set(addedLrs.map(b => b.lrNo));
        const allBookings = getBookings();
        const updatedBookings = allBookings.map(b => {
            if (addedLrNos.has(b.lrNo)) {
                addHistoryLog(b.lrNo, 'In Stock', companyProfile?.companyName || 'System', `Received at ${newChallanData.toStation} via Inward Challan ${newChallanData.inwardId}`);
                return { ...b, status: 'In Stock' as const };
            }
            return b;
        });
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
                            <CardTitle>LR Details</CardTitle>
                            <div className="flex items-center gap-2">
                                <Input value={lrSearch} onChange={(e) => setLrSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLr(); }}} placeholder="Scan or enter LR number..." />
                                <Button type="button" onClick={handleAddLr}><ArrowDown className="mr-2 h-4 w-4"/> Add LR</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="overflow-y-auto h-60 border rounded-md">
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
                        <Button type="button" variant="outline" onClick={() => router.push('/company/challan')}><X className="mr-2 h-4 w-4"/> Cancel</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Save Inward Challan
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

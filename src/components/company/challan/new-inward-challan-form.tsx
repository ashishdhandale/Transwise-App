
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
import { FileText, Loader2, PlusCircle, Save, X, Pencil, Trash2, ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
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

const generateInwardChallanId = (challans: Challan[]): string => {
    const prefix = 'INW-';
    const relevantIds = challans.map(c => c.inwardId).filter(id => id && id.startsWith(prefix));
    if (relevantIds.length === 0) return `${prefix}01`;
    const lastNum = relevantIds.map(id => parseInt(id.substring(prefix.length), 10)).filter(n => !isNaN(n)).reduce((max, current) => Math.max(max, current), 0);
    return `${prefix}${String(lastNum + 1).padStart(2, '0')}`;
};

const emptyLr: Omit<Booking, 'trackingId'> = {
    lrNo: '', bookingDate: new Date().toISOString(), fromCity: '', toCity: '',
    lrType: 'TOPAY', loadType: 'LTL', sender: '', receiver: '', itemDescription: '',
    qty: 0, chgWt: 0, totalAmount: 0, status: 'In Stock', itemRows: [], source: 'Inward',
};


export function NewInwardChallanForm() {
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    
    // State for the inline form
    const [currentLr, setCurrentLr] = useState<Booking>(emptyLr as Booking);
    const [editingLrId, setEditingLrId] = useState<string | null>(null);

    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<InwardChallanFormValues>({
        resolver: zodResolver(inwardChallanSchema),
        defaultValues: { 
            inwardId: '', inwardDate: undefined, originalChallanNo: '', receivedFromParty: '', vehicleNo: '', driverName: '', fromStation: '', remarks: ''
        }
    });
    
    const tempChallanId = useMemo(() => `TEMP-INW-${Date.now()}`, []);

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
                    setIsHeaderOpen(false); // Collapse header in edit mode
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
                        itemRows: [],
                        status: 'In Stock',
                        source: 'Inward',
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
    
    const handleAddOrUpdateLr = () => {
        if (!currentLr.lrNo || !currentLr.fromCity || !currentLr.toCity || !currentLr.sender || !currentLr.receiver || !currentLr.qty) {
            toast({ title: "Incomplete LR Details", description: "Please fill all required fields for the LR.", variant: "destructive" });
            return;
        }

        if (editingLrId) {
            setAddedLrs(prevLrs => prevLrs.map(lr => lr.trackingId === editingLrId ? currentLr : lr));
            toast({ title: "LR Updated", description: "The LR details have been updated in the list." });
        } else {
            setAddedLrs(prevLrs => [...prevLrs, { ...currentLr, trackingId: `temp-${Date.now()}` }]);
        }
        setCurrentLr(emptyLr as Booking);
        setEditingLrId(null);
    };

    const handleEditLr = (lrToEdit: Booking) => {
        setEditingLrId(lrToEdit.trackingId);
        setCurrentLr(lrToEdit);
    };
    
    const handleRemoveLr = (trackingId: string) => {
        setAddedLrs(prevLrs => prevLrs.filter(lr => lr.trackingId !== trackingId));
    };

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);
    const customerOptions = useMemo(() => customers.map(c => ({ label: c.name, value: c.name })), [customers]);

    const createChallanObject = (status: 'Pending' | 'Finalized') => {
        const formData = form.getValues();
        const existingChallanId = searchParams.get('challanId');
        const finalChallanId = status === 'Finalized' ? (existingChallanId || formData.inwardId) : (existingChallanId || tempChallanId);

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
            status,
            dispatchDate: formData.inwardDate.toISOString(),
            dispatchToParty: '',
            totalLr: addedLrs.length,
            totalPackages: addedLrs.reduce((s, b) => s + b.qty, 0),
            totalItems: addedLrs.length,
            totalActualWeight: 0,
            totalChargeWeight: addedLrs.reduce((s, b) => s + b.chgWt, 0),
            vehicleHireFreight: 0, advance: 0, balance: 0, senderId: '',
            remark: formData.remarks,
            summary: { grandTotal: addedLrs.reduce((s, b) => s + b.totalAmount, 0), totalTopayAmount: 0, commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0 },
        };
        
        const newLrDetails: LrDetail[] = addedLrs.map(b => ({
            challanId: finalChallanId, lrNo: b.lrNo, lrType: b.lrType, sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: b.bookingDate, itemDescription: b.itemDescription,
            quantity: b.qty, actualWeight: 0, chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));

        return { challan: newChallanData, lrDetails: newLrDetails };
    }

    const handleSaveAsTemp = () => {
        const { challan, lrDetails } = createChallanObject('Pending');
        
        const allChallans = getChallanData();
        const existingIndex = allChallans.findIndex(c => c.challanId === challan.challanId);
        if (existingIndex > -1) {
            allChallans[existingIndex] = challan;
        } else {
            allChallans.push(challan);
        }
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== challan.challanId);
        allLrDetails.push(...lrDetails);
        saveLrDetailsData(allLrDetails);
        
        toast({ title: 'Challan Saved as Temporary', description: `Your progress for inward challan has been saved.` });
        router.push('/company/challan');
    };

    const onSubmit = (data: InwardChallanFormValues) => {
        if (addedLrs.length === 0) {
            toast({ title: 'No LRs', description: 'Please add at least one LR to create an inward challan.', variant: 'destructive' });
            return;
        }
        
        const { challan, lrDetails } = createChallanObject('Finalized');

        let allChallans = getChallanData();
        const existingChallanId = searchParams.get('challanId');
        if (existingChallanId) {
            allChallans = allChallans.filter(c => c.challanId !== existingChallanId);
        }
        allChallans.push(challan);
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== challan.challanId && d.challanId !== existingChallanId);
        allLrDetails.push(...lrDetails);
        saveLrDetailsData(allLrDetails);
        
        lrDetails.forEach(lr => {
             addHistoryLog(lr.lrNo, 'In Stock', 'System (Inward)', `Received via Inward Challan ${data.inwardId} at ${challan.toStation}.`);
        });
        
        toast({ title: 'Inward Challan Saved', description: `Successfully created Inward Challan ${data.inwardId}. ${lrDetails.length} LRs added to stock.`});
        router.push('/company/challan');
    };

    const totalQty = useMemo(() => addedLrs.reduce((sum, lr) => sum + lr.qty, 0), [addedLrs]);
    const totalActWt = useMemo(() => addedLrs.reduce((sum, lr) => sum + lr.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0), [addedLrs]);
    const totalAmount = useMemo(() => addedLrs.reduce((sum, lr) => sum + lr.totalAmount, 0), [addedLrs]);
    const formatValue = (amount: number) => companyProfile ? amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount.toFixed(2);


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
                    <Collapsible open={isHeaderOpen} onOpenChange={setIsHeaderOpen}>
                        <Card>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Challan Details</CardTitle>
                                        <ChevronsUpDown className={cn("h-5 w-5 transition-transform", isHeaderOpen && "rotate-180")} />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
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
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                    
                    <Card>
                        <CardHeader><CardTitle>Add/Edit LR Details</CardTitle></CardHeader>
                        <CardContent className="p-4 border rounded-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 items-end">
                            <div className="space-y-1"><Label>LR No*</Label><Input value={currentLr.lrNo} onChange={(e) => setCurrentLr(p => ({...p, lrNo: e.target.value}))}/></div>
                            <div className="space-y-1"><Label>From*</Label><Combobox options={cityOptions} value={currentLr.fromCity} onChange={(v) => setCurrentLr(p => ({...p, fromCity: v}))} placeholder="From..."/></div>
                            <div className="space-y-1"><Label>To*</Label><Combobox options={cityOptions} value={currentLr.toCity} onChange={(v) => setCurrentLr(p => ({...p, toCity: v}))} placeholder="To..."/></div>
                            <div className="space-y-1"><Label>Sender*</Label><Combobox options={customerOptions} value={currentLr.sender} onChange={(v) => setCurrentLr(p => ({...p, sender: v}))} placeholder="Sender..."/></div>
                            <div className="space-y-1"><Label>Receiver*</Label><Combobox options={customerOptions} value={currentLr.receiver} onChange={(v) => setCurrentLr(p => ({...p, receiver: v}))} placeholder="Receiver..."/></div>
                            <div className="space-y-1"><Label>Item Desc.</Label><Input value={currentLr.itemDescription} onChange={(e) => setCurrentLr(p => ({...p, itemDescription: e.target.value}))}/></div>
                            <div className="space-y-1"><Label>Qty*</Label><Input type="number" value={currentLr.qty} onChange={(e) => setCurrentLr(p => ({...p, qty: Number(e.target.value)}))}/></div>
                            <div className="space-y-1"><Label>Chg. Wt.</Label><Input type="number" value={currentLr.chgWt} onChange={(e) => setCurrentLr(p => ({...p, chgWt: Number(e.target.value)}))}/></div>
                            <div className="space-y-1"><Label>Booking Type</Label>
                                <Select value={currentLr.lrType} onValueChange={(v) => setCurrentLr(p => ({...p, lrType: v as any}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {bookingOptions.bookingTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1"><Label>Total Amt</Label><Input type="number" value={currentLr.totalAmount} onChange={(e) => setCurrentLr(p => ({...p, totalAmount: Number(e.target.value)}))}/></div>
                            <Button type="button" onClick={handleAddOrUpdateLr} className="self-end">
                               {editingLrId ? 'Update LR' : 'Add to List'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>LRs Received</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto border rounded-md min-h-48">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">LR No</TableHead>
                                            <TableHead className="whitespace-nowrap">From</TableHead>
                                            <TableHead className="whitespace-nowrap">To</TableHead>
                                            <TableHead className="whitespace-nowrap">Sender</TableHead>
                                            <TableHead className="whitespace-nowrap">Receiver</TableHead>
                                            <TableHead className="whitespace-nowrap">Item</TableHead>
                                            <TableHead className="whitespace-nowrap">Qty</TableHead>
                                            <TableHead className="whitespace-nowrap">Chg. Wt.</TableHead>
                                            <TableHead className="whitespace-nowrap">Booking Type</TableHead>
                                            <TableHead className="whitespace-nowrap">Total</TableHead>
                                            <TableHead className="whitespace-nowrap">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addedLrs.map(lr => (
                                            <TableRow key={lr.trackingId}>
                                                <TableCell className="whitespace-nowrap">{lr.lrNo}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.fromCity}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.toCity}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.sender}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.receiver}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.itemDescription}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.qty}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.chgWt}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.lrType}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.totalAmount.toFixed(2)}</TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditLr(lr)}><Pencil className="h-4 w-4 text-blue-600"/></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveLr(lr.trackingId)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {addedLrs.length === 0 && (
                                            <TableRow><TableCell colSpan={11} className="text-center h-24 text-muted-foreground">No LRs added yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                    {addedLrs.length > 0 && (
                                        <TableFooter>
                                            <TableRow className="font-bold bg-muted/50">
                                                <TableCell className="whitespace-nowrap">Total</TableCell>
                                                <TableCell colSpan={5} className="whitespace-nowrap">{addedLrs.length} LRs</TableCell>
                                                <TableCell className="whitespace-nowrap">{totalQty}</TableCell>
                                                <TableCell className="whitespace-nowrap">{addedLrs.reduce((sum, lr) => sum + lr.chgWt, 0).toFixed(2)}</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell className="whitespace-nowrap">{formatValue(totalAmount)}</TableCell>
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
                            <FormField name="remarks" control={form.control} render={({ field }) => (
                                <FormItem><Textarea placeholder="Note any damages, shortages, or other remarks..." {...field} /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="destructive" onClick={() => router.push('/company/challan')}><X className="mr-2 h-4 w-4"/> Cancel & Exit</Button>
                        <Button type="button" variant="outline" onClick={handleSaveAsTemp}><Save className="mr-2 h-4 w-4" /> Save as Temp & Exit</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Finalize & Save Inward
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

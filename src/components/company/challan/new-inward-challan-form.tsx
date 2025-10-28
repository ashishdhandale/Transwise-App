

'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import { loadCompanySettingsFromStorage, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCities } from '@/lib/city-data';
import { getCustomers } from '@/lib/customer-data';
import { Textarea } from '@/components/ui/textarea';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { FileText, Save, X, Pencil, Trash2, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { BookingForm } from '../bookings/booking-form';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';

const inwardChallanSchema = z.object({
  inwardId: z.string(),
  originalChallanNo: z.string().optional(),
  inwardDate: z.date(),
  fromStation: z.string().min(1, 'From station is required'),
  receivedFromParty: z.string().min(1, 'Received from is required'),
  vehicleNo: z.string().min(1, 'Vehicle number is required'),
  driverName: z.string().optional(),
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

const SummaryItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex items-baseline">
        <span className="text-xs font-medium text-muted-foreground mr-1">{label}:</span>
        <span className="text-sm font-semibold text-primary">{value || 'N/A'}</span>
    </div>
);


export function NewInwardChallanForm() {
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [addedLrs, setAddedLrs] = useState<Booking[]>([]);
    const [bookingDataToEdit, setBookingDataToEdit] = useState<Booking | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [bookingFormKey, setBookingFormKey] = useState(Date.now());


    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    const [isLrFormOpen, setIsLrFormOpen] = useState(true);
    
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = !!searchParams.get('challanId');
    
    const lrNumberInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<InwardChallanFormValues>({
        resolver: zodResolver(inwardChallanSchema),
        defaultValues: { 
            inwardId: '', inwardDate: undefined, originalChallanNo: '', receivedFromParty: '', vehicleNo: '', driverName: '', fromStation: '', remarks: ''
        }
    });
    
    const watchedChallanValues = form.watch();

    const [tempChallanId, setTempChallanId] = useState('');

    useEffect(() => {
        setTempChallanId(`TEMP-INW-${Date.now()}`);
    }, []);

    useEffect(() => {
        async function loadInitialData() {
            const profile = await loadCompanySettingsFromStorage();
            setCompanyProfile(profile);
            setCities(getCities());
            setCustomers(getCustomers());
            const allChallans = getChallanData();
            const allBookings = getBookings();
            
            const existingChallanId = searchParams.get('challanId');
            if (existingChallanId) {
                const challan = allChallans.find(c => c.challanId === existingChallanId);
                if (challan) {
                    setIsHeaderOpen(false); // Collapse header in edit mode
                    if (challan.status === 'Finalized') {
                        setIsFinalized(true);
                    }
                    form.reset({
                        inwardId: challan.inwardId,
                        originalChallanNo: challan.originalChallanNo,
                        inwardDate: challan.inwardDate ? new Date(challan.inwardDate) : new Date(),
                        fromStation: challan.fromStation,
                        receivedFromParty: challan.receivedFromParty,
                        vehicleNo: challan.vehicleNo,
                        driverName: challan.driverName,
                        remarks: challan.remark
                    });
                    
                    const lrDetailsForChallan = getLrDetailsData().filter(lr => lr.challanId === existingChallanId);
                    
                    const reconstructedBookings: Booking[] = lrDetailsForChallan.map(lr => {
                        const booking = allBookings.find(b => b.lrNo === lr.lrNo);
                        return {
                            ...(booking || {}),
                            trackingId: booking?.trackingId || `temp-${lr.lrNo}-${Math.random()}`,
                            lrNo: lr.lrNo,
                            referenceLrNumber: lr.lrNo, // For inward, lrNo is the manual number
                            lrType: lr.lrType as any, 
                            bookingDate: lr.bookingDate,
                            fromCity: lr.from, toCity: lr.to, 
                            sender: booking?.sender || { name: lr.sender.name, gstin: lr.sender.gstin, address: lr.sender.address, mobile: lr.sender.mobile },
                            receiver: booking?.receiver || { name: lr.receiver.name, gstin: lr.receiver.gstin, address: lr.receiver.address, mobile: lr.receiver.mobile },
                            itemDescription: lr.itemDescription, qty: lr.quantity, chgWt: lr.chargeWeight,
                            totalAmount: lr.grandTotal,
                            itemRows: booking?.itemRows || [],
                            status: booking?.status || 'In Stock',
                            source: 'Inward',
                            loadType: booking?.loadType || 'LTL'
                        } as Booking;
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
    
    const handleAddOrUpdateLr = useCallback((booking: Booking) => {
        const existingLrIndex = addedLrs.findIndex(lr => lr.trackingId === booking.trackingId);
        
        if (existingLrIndex > -1) {
            // Update existing LR
            const updatedLrs = [...addedLrs];
            updatedLrs[existingLrIndex] = booking;
            setAddedLrs(updatedLrs);
            toast({ title: 'LR Updated', description: `LR# ${booking.referenceLrNumber} has been updated in the list.` });
            setIsEditDialogOpen(false); // Close dialog on update
        } else {
            // Add new LR
            setAddedLrs(prev => [...prev, { ...booking, trackingId: `temp-${Date.now()}` }]);
            toast({ title: 'LR Added', description: `LR# ${booking.referenceLrNumber} has been added to the list.` });
        }
        setBookingDataToEdit(null); // Reset editing state
        setBookingFormKey(Date.now()); // Reset booking form
        if (lrNumberInputRef.current) {
            lrNumberInputRef.current.focus();
        }
    }, [addedLrs, toast]);
    
    const handleEditLrClick = (lrToEdit: Booking) => {
        setBookingDataToEdit(lrToEdit);
        setIsEditDialogOpen(true);
    };

    const handleCloseEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        setBookingDataToEdit(null);
    }, []);

    const handleRemoveLr = (trackingId: string) => {
        setAddedLrs(prevLrs => prevLrs.filter(lr => lr.trackingId !== trackingId));
    };

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [cities]);
    const customerOptions = useMemo(() => customers.map(c => ({ label: c.name, value: c.name })), [customers]);

    const createChallanObject = (status: 'Pending' | 'Finalized', newId?: string) => {
        const formData = form.getValues();
        const existingChallanId = searchParams.get('challanId');
        
        let finalChallanId: string;
        if (status === 'Finalized') {
            finalChallanId = newId || existingChallanId || formData.inwardId;
        } else {
            finalChallanId = existingChallanId || tempChallanId;
        }


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
            totalItems: addedLrs.reduce((s, b) => s + (b.itemRows?.length || 1), 0), // Fallback to 1 item if rows not detailed
            totalActualWeight: 0,
            totalChargeWeight: addedLrs.reduce((s, b) => s + b.chgWt, 0),
            vehicleHireFreight: 0, advance: 0, balance: 0, senderId: '',
            remark: formData.remarks,
            summary: { grandTotal: addedLrs.reduce((s, b) => s + b.totalAmount, 0), totalTopayAmount: 0, commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0 },
        };
        
        const newLrDetails: LrDetail[] = addedLrs.map(b => ({
            challanId: finalChallanId, 
            lrNo: b.referenceLrNumber || b.lrNo, // Use manual LR number
            lrType: b.lrType, 
            sender: b.sender, receiver: b.receiver,
            from: b.fromCity, to: b.toCity, bookingDate: b.bookingDate, itemDescription: b.itemDescription,
            quantity: b.qty, actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), chargeWeight: b.chgWt, grandTotal: b.totalAmount
        }));

        return { challan: newChallanData, lrDetails: newLrDetails };
    }

    const handleSaveAsTemp = () => {
        const result = createChallanObject('Pending');
        if (!result) return;
        const { challan, lrDetails } = result;
        
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
        
        toast({ title: isEditMode ? 'Challan Updated' : 'Challan Saved as Temporary', description: `Your progress for inward challan has been saved.` });
        router.push('/company/challan');
    };

    const onSubmit = (data: InwardChallanFormValues) => {
        if (addedLrs.length === 0) {
            toast({ title: 'No LRs', description: 'Please add at least one LR to create an inward challan.', variant: 'destructive' });
            return;
        }
        
        const result = createChallanObject('Finalized', data.inwardId);
        if (!result) return;
        const { challan, lrDetails } = result;

        let allChallans = getChallanData();
        
        const existingChallanId = searchParams.get('challanId');
        allChallans = allChallans.filter(c => c.challanId !== existingChallanId && c.challanId !== tempChallanId);
        allChallans.push(challan);
        saveChallanData(allChallans);

        let allLrDetails = getLrDetailsData().filter(d => d.challanId !== existingChallanId && d.challanId !== tempChallanId);
        allLrDetails.push(...lrDetails);
        saveLrDetailsData(allLrDetails);
        
        lrDetails.forEach(lr => {
             addHistoryLog(lr.lrNo, 'In Stock', 'System (Inward)', `Received via Inward Challan ${data.inwardId} at ${challan.toStation}.`);
        });
        
        toast({ title: isEditMode ? 'Inward Challan Updated' : 'Inward Challan Saved', description: `Successfully processed Inward Challan ${data.inwardId}. ${lrDetails.length} LRs recorded.`});
        router.push('/company/challan');
    };

    const totalQty = useMemo(() => addedLrs.reduce((sum, lr) => sum + lr.qty, 0), [addedLrs]);
    const totalAmount = useMemo(() => addedLrs.reduce((sum, lr) => sum + lr.totalAmount, 0), [addedLrs]);
    const formatValue = (amount: number) => companyProfile ? amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount.toFixed(2);


    return (
        <div className="space-y-4">
            <Form {...form}>
                <form id="inward-challan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Collapsible open={isHeaderOpen} onOpenChange={setIsHeaderOpen}>
                        <Card>
                             <CollapsibleTrigger className="w-full">
                                <CardHeader className="cursor-pointer p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <CardTitle className="text-lg">{isEditMode ? 'Edit Inward Challan' : 'New Inward Challan'}</CardTitle>
                                             {!isHeaderOpen && (
                                                <div className="flex items-center gap-x-4 text-xs text-muted-foreground">
                                                    <span>Inward ID: <span className="font-semibold text-foreground">{watchedChallanValues.inwardId}</span></span>
                                                    <span>Vehicle: <span className="font-semibold text-foreground">{watchedChallanValues.vehicleNo}</span></span>
                                                    <span>From: <span className="font-semibold text-foreground">{watchedChallanValues.fromStation}</span></span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronsUpDown className={cn("h-5 w-5 transition-transform", isHeaderOpen && "rotate-180")} />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="pt-2 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <FormField name="inwardId" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Inward ID</FormLabel><FormControl><Input {...field} readOnly className="font-bold text-red-600 bg-red-50"/></FormControl></FormItem>
                                    )}/>
                                     <FormField name="originalChallanNo" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Original Challan No</FormLabel><FormControl><Input placeholder="Original Challan No" {...field} /></FormControl></FormItem>
                                    )}/>
                                    <FormField name="inwardDate" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Inward Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl></FormItem>
                                    )}/>
                                    <FormField name="fromStation" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Station</FormLabel>
                                            <Combobox options={cityOptions} value={field.value} onChange={field.onChange} placeholder="Select Origin..." />
                                            <FormMessage />
                                        </FormItem>
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
                                     <FormField name="remarks" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="Note any damages, etc." {...field} rows={1}/></FormControl></FormItem>
                                    )}/>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                    
                     <Collapsible open={isLrFormOpen} onOpenChange={setIsLrFormOpen}>
                        <Card>
                             <CollapsibleTrigger className="w-full">
                                <CardHeader className="cursor-pointer p-4">
                                     <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Add Received LR</CardTitle>
                                        <ChevronsUpDown className={cn("h-5 w-5 transition-transform", isLrFormOpen && "rotate-180")} />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent>
                                    <BookingForm
                                        key={bookingFormKey}
                                        isForInward={true}
                                        onSave={handleAddOrUpdateLr}
                                        lrNumberInputRef={lrNumberInputRef}
                                    />
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>


                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                            <CardTitle>LRs Received</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto border-t">
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
                                                <TableCell className="whitespace-nowrap">{lr.referenceLrNumber}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.fromCity}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.toCity}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.sender.name}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.receiver.name}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.itemDescription}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.qty}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.chgWt.toFixed(2)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.lrType}</TableCell>
                                                <TableCell className="whitespace-nowrap">{lr.totalAmount.toFixed(2)}</TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleEditLrClick(lr)}><Pencil className="h-4 w-4 text-blue-600"/></Button>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLr(lr.trackingId)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
                                                <TableCell colSpan={6} className="whitespace-nowrap text-right">Total</TableCell>
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
                    
                    <div id="form-actions-placeholder"></div>
                </form>
            </Form>
            
            <div id="save-temp-button-handler" onClick={handleSaveAsTemp} style={{ display: 'none' }} />
            <script
                dangerouslySetInnerHTML={{
                __html: `
                    const button = document.getElementById('save-temp-button');
                    const handler = document.getElementById('save-temp-button-handler');
                    if (button && handler) {
                        button.addEventListener('click', () => handler.click());
                    }
                `,
                }}
            />


            {bookingDataToEdit && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Edit Inward LR Details: {bookingDataToEdit.referenceLrNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-auto pr-6">
                            <BookingForm 
                                isForInward={true}
                                bookingData={bookingDataToEdit}
                                onSave={handleAddOrUpdateLr}
                                onClose={handleCloseEditDialog}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

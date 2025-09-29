
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';
import { getVendors, saveVendors, type Vendor } from '@/lib/vendor-data';
import { type VehicleHireReceipt, saveVehicleHireReceipts, getVehicleHireReceipts } from '@/lib/vehicle-hire-data';
import { addVoucher } from '@/lib/accounts-data';
import { LorryHireChallan } from './lorry-hire-challan';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AddVendorDialog } from '../master/add-vendor-dialog';

const hireSchema = z.object({
  receiptNo: z.string(),
  date: z.date(),
  supplierId: z.string().min(1, 'Supplier is required'),
  vehicleNo: z.string().min(1, 'Vehicle number is required'),
  driverName: z.string().min(1, 'Driver name is required'),
  capacity: z.coerce.number().optional(),
  overloadCapacity: z.coerce.number().optional(),
  fromStation: z.string().min(1, 'From station is required'),
  toStation: z.string().min(1, 'To station is required'),
  freight: z.coerce.number().min(0),
  advance: z.coerce.number().min(0),
  balance: z.coerce.number(),
  remarks: z.string().optional(),
});

type HireFormValues = z.infer<typeof hireSchema>;

interface VehicleHireFormProps {
    onSaveSuccess: () => void;
    onCancel: () => void;
    existingReceipt: VehicleHireReceipt | null;
}

export function VehicleHireForm({ onSaveSuccess, onCancel, existingReceipt }: VehicleHireFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Master Data
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    // Dialog State
    const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
    const [initialVendorData, setInitialVendorData] = useState<Partial<Vendor> | null>(null);

    // Preview
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<VehicleHireReceipt | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const printRef = React.useRef<HTMLDivElement>(null);


    const form = useForm<HireFormValues>({
        resolver: zodResolver(hireSchema),
        defaultValues: {
            receiptNo: '',
            date: new Date(),
            freight: 0,
            advance: 0,
            balance: 0,
            remarks: '',
            capacity: 0,
            overloadCapacity: 0,
        },
    });
    
    const loadMasterData = () => {
        setVendors(getVendors().filter(v => v.type === 'Vehicle Supplier'));
    };

    useEffect(() => {
        async function loadInitial() {
            loadMasterData();
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);

            if (existingReceipt) {
                form.reset({
                    ...existingReceipt,
                    date: new Date(existingReceipt.date),
                    supplierId: String(existingReceipt.supplierId),
                });
            } else {
                 const allReceipts = getVehicleHireReceipts();
                 const lastReceiptNo = allReceipts.map(r => parseInt(r.receiptNo.replace('VH-', ''), 10)).filter(n => !isNaN(n)).reduce((max, current) => Math.max(max, current), 0);
                 form.setValue('receiptNo', `VH-${String(lastReceiptNo + 1).padStart(4, '0')}`);
            }
        }
        loadInitial();
    }, [form, existingReceipt]);

    const freight = form.watch('freight');
    const advance = form.watch('advance');

    useEffect(() => {
        form.setValue('balance', freight - advance);
    }, [freight, advance, form]);
    
    const handleOpenAddVendor = (query?: string) => {
        setInitialVendorData(query ? { name: query, type: 'Vehicle Supplier' } : null);
        setIsAddVendorOpen(true);
    };

    const handleSaveVendor = (vendorData: Omit<Vendor, 'id'>) => {
        const allVendors = getVendors();
        const newVendor: Vendor = { 
            id: allVendors.length > 0 ? Math.max(...allVendors.map(v => v.id)) + 1 : 1,
            ...vendorData
        };
        const updatedVendors = [newVendor, ...allVendors];
        saveVendors(updatedVendors);
        loadMasterData(); // Refresh vendor list
        form.setValue('supplierId', String(newVendor.id));
        toast({ title: 'Supplier Added', description: `Supplier "${newVendor.name}" has been created.`});
        return true;
    };


    const onSubmit = (data: HireFormValues) => {
        setIsSubmitting(true);
        const allReceipts = getVehicleHireReceipts();
        const supplier = vendors.find(v => v.id === Number(data.supplierId));
        if (!supplier) {
            toast({title: "Error", description: "Invalid supplier selected.", variant: "destructive"});
            setIsSubmitting(false);
            return;
        }

        const newReceipt: VehicleHireReceipt = {
            ...data,
            id: existingReceipt?.id || Date.now(),
            supplierId: Number(data.supplierId),
            supplierName: supplier.name,
            date: data.date.toISOString(),
        };

        let updatedReceipts;
        if (existingReceipt) {
             updatedReceipts = allReceipts.map(r => r.id === existingReceipt.id ? newReceipt : r);
        } else {
            updatedReceipts = [...allReceipts, newReceipt];
        }

        saveVehicleHireReceipts(updatedReceipts);
        
        // Accounting Entries
        addVoucher({
            type: 'Journal',
            date: newReceipt.date,
            account: 'Truck Hire Charges',
            amount: newReceipt.freight,
            narration: `Hiring vehicle ${newReceipt.vehicleNo} from ${newReceipt.supplierName} for route ${newReceipt.fromStation}-${newReceipt.toStation}. Ref: ${newReceipt.receiptNo}`,
        });
        addVoucher({
            type: 'Journal',
            date: newReceipt.date,
            account: newReceipt.supplierName,
            amount: newReceipt.freight,
            narration: `Credit for hiring vehicle ${newReceipt.vehicleNo}. Ref: ${newReceipt.receiptNo}`,
        });

        if (newReceipt.advance > 0) {
             addVoucher({
                type: 'Payment',
                date: newReceipt.date,
                account: newReceipt.supplierName,
                amount: newReceipt.advance,
                narration: `Advance payment for vehicle hire. Ref: ${newReceipt.receiptNo}`,
            });
             addVoucher({
                type: 'Payment',
                date: newReceipt.date,
                account: 'Cash', // Assuming cash payment for simplicity
                amount: newReceipt.advance,
                narration: `Advance paid to ${newReceipt.supplierName}. Ref: ${newReceipt.receiptNo}`,
            });
        }
        
        toast({ title: existingReceipt ? 'Receipt Updated' : 'Receipt Created', description: 'The vehicle hire receipt has been saved.' });
        setPreviewData(newReceipt);
        setIsPreviewOpen(true);
    };
    
    const handleDownloadPdf = async () => {
        const input = printRef.current;
        if (!input || !previewData) return;
        setIsDownloading(true);
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // Margin
        const imgHeight = (imgWidth * canvas.height) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`hire-receipt-${previewData.receiptNo}.pdf`);
        setIsDownloading(false);
    };

    const vendorOptions = vendors.map(v => ({ label: v.name, value: String(v.id) }));

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{existingReceipt ? 'Edit Vehicle Hire Receipt' : 'Create Vehicle Hire Receipt'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <FormField name="receiptNo" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Receipt No.</FormLabel><FormControl><Input {...field} readOnly className="font-bold text-red-600"/></FormControl></FormItem>
                                )}/>
                                <FormField name="date" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl></FormItem>
                                )}/>
                                <FormField name="supplierId" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <Combobox 
                                            options={vendorOptions} 
                                            placeholder="Select Supplier" 
                                            {...field} 
                                            addMessage="Add New Supplier"
                                            onAdd={handleOpenAddVendor}
                                        />
                                    </FormItem>
                                )}/>
                                <FormField name="vehicleNo" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Vehicle No.</FormLabel><FormControl><Input placeholder="Enter Vehicle No." {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField name="driverName" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Driver Name</FormLabel><FormControl><Input placeholder="Enter Driver Name" {...field} /></FormControl></FormItem>
                                )}/>
                                 <FormField name="capacity" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Vehicle Capacity (Kg)</FormLabel><FormControl><Input type="number" placeholder="e.g. 10000" {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField name="overloadCapacity" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Overload Capacity (Kg)</FormLabel><FormControl><Input type="number" placeholder="e.g. 1000" {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField name="fromStation" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>From</FormLabel><FormControl><Input placeholder="Enter Origin" {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField name="toStation" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>To</FormLabel><FormControl><Input placeholder="Enter Destination" {...field} /></FormControl></FormItem>
                                )}/>
                            </div>
                            <Card className="p-4 bg-muted/50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <FormField name="freight" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Freight Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                                    )}/>
                                     <FormField name="advance" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Advance Paid</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                                    )}/>
                                     <FormField name="balance" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Balance</FormLabel><FormControl><Input type="number" {...field} readOnly className="font-bold"/></FormControl><FormMessage/></FormItem>
                                    )}/>
                                </div>
                            </Card>
                            <FormField name="remarks" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea {...field} placeholder="Add any remarks..."/></FormControl></FormItem>
                            )}/>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={onCancel}><X className="mr-2"/> Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                                    {existingReceipt ? 'Update Receipt' : 'Save Receipt'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <AddVendorDialog 
                isOpen={isAddVendorOpen}
                onOpenChange={setIsAddVendorOpen}
                onSave={handleSaveVendor}
                vendor={initialVendorData}
            />

            {previewData && companyProfile && (
                <Dialog open={isPreviewOpen} onOpenChange={(isOpen) => {
                    if (!isOpen) { onSaveSuccess(); }
                    setIsPreviewOpen(isOpen);
                }}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader><DialogTitle>Hire Receipt Preview</DialogTitle></DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200">
                            <div ref={printRef}><LorryHireChallan receipt={previewData} profile={companyProfile}/></div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => onSaveSuccess()}>Close & Finish</Button>
                            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="mr-2 animate-spin"/> : null} Download PDF
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

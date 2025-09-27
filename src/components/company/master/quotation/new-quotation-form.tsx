
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Printer, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { City, Customer, Item, RateList, RateOnType, StationRate } from '@/lib/types';
import { getCities } from '@/lib/city-data';
import { getItems } from '@/lib/item-data';
import { getCustomers } from '@/lib/customer-data';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { bookingOptions } from '@/lib/booking-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveRateLists, getRateLists } from '@/lib/rate-list-data';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrintableQuotation } from './printable-quotation';
import { getCompanyProfile, type CompanyProfileFormValues } from '@/app/company/settings/actions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const rateOnOptions: { label: string; value: RateOnType }[] = [
    { label: 'Chg. Wt.', value: 'Chg.wt' },
    { label: 'Act. Wt.', value: 'Act.wt' },
    { label: 'Quantity', value: 'Quantity' },
    { label: 'Fixed', value: 'Fixed' },
];

interface QuotationItem extends StationRate {
    id: number;
    itemName?: string;
    description?: string;
    wtPerUnit?: number;
}

let nextId = 1;

export function NewQuotationForm() {
    const [quotationNo, setQuotationNo] = useState('001');
    const [quotationDate, setQuotationDate] = useState<Date | undefined>(new Date());
    const [partyName, setPartyName] = useState<string | undefined>(undefined);
    const [defaultLrType, setDefaultLrType] = useState('TOPAY');
    const [items, setItems] = useState<QuotationItem[]>([]);
    
    // Master data
    const [cities, setCities] = useState<City[]>([]);
    const [masterItems, setMasterItems] = useState<Item[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    
    // Current item entry
    const [fromStation, setFromStation] = useState<string | undefined>();
    const [toStation, setToStation] = useState<string | undefined>();
    const [itemName, setItemName] = useState<string | undefined>();
    const [description, setDescription] = useState('');
    const [wtPerUnit, setWtPerUnit] = useState<number | ''>('');
    const [rate, setRate] = useState<number | ''>('');
    const [rateOn, setRateOn] = useState<RateOnType>('Chg.wt');
    const [lrType, setLrType] = useState(defaultLrType);


    // Preview Dialog
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [savedQuotationData, setSavedQuotationData] = useState<{ party?: Customer, items: QuotationItem[] } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { toast } = useToast();
    const router = useRouter();


    useEffect(() => {
        async function loadData() {
            setCities(getCities());
            setMasterItems(getItems());
            setCustomers(getCustomers());
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);

            const allRateLists = getRateLists();
            const lastQuoteNo = allRateLists
                .filter(rl => rl.name.startsWith('Quotation for'))
                .length;
            setQuotationNo(String(lastQuoteNo + 1).padStart(4, '0'));
        }
        loadData();
    }, []);
    
    useEffect(() => {
        setLrType(defaultLrType);
    }, [defaultLrType]);

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name, value: c.name })), [cities]);
    const itemOptions = useMemo(() => masterItems.map(i => ({ label: i.name, value: i.name })), [masterItems]);
    const customerOptions = useMemo(() => [{label: 'Default Rate List', value: 'Default Rate List'}, ...customers.map(c => ({ label: c.name, value: c.name }))], [customers]);

    const handleAddToList = () => {
        if (!fromStation || !toStation || rate === '') {
            toast({ title: "Missing fields", description: "From, To and Rate are required to add an item.", variant: "destructive" });
            return;
        }

        const newItem: QuotationItem = {
            id: nextId++,
            fromStation,
            toStation,
            rate: Number(rate),
            rateOn,
            itemName: itemName || 'Any',
            description,
            wtPerUnit: Number(wtPerUnit) || undefined,
            lrType,
        };

        setItems(prev => [...prev, newItem]);
        resetEntryFields();
    };
    
    const resetEntryFields = () => {
        setItemName(undefined);
        setDescription('');
        setWtPerUnit('');
        setRate('');
        setRateOn('Chg.wt');
        setLrType(defaultLrType);
    }
    
    const handleSaveQuotation = () => {
        if (!partyName) {
            toast({ title: 'Party Name Required', description: 'Please select a party name for this quotation.', variant: "destructive" });
            return;
        }

        if (items.length === 0) {
            toast({ title: 'No Items', description: 'Please add at least one item to the quotation.', variant: "destructive" });
            return;
        }
        
        const customer = customers.find(c => c.name === partyName);
        
        const newRateList: Omit<RateList, 'id'> = {
            name: `Quotation for ${partyName} - ${new Date().toLocaleDateString()}`,
            isStandard: partyName === 'Default Rate List',
            customerIds: customer ? [customer.id] : [],
            stationRates: items.map(({ fromStation, toStation, rate, rateOn, lrType, itemName, description, wtPerUnit }) => ({ fromStation, toStation, rate, rateOn, lrType, itemName, description, wtPerUnit })),
            itemRates: [],
        };

        const allRateLists = getRateLists();
        const newId = allRateLists.length > 0 ? Math.max(...allRateLists.map(rl => rl.id)) + 1 : 1;
        
        saveRateLists([...allRateLists, { id: newId, ...newRateList }]);
        
        setSavedQuotationData({ party: customer, items });
        setIsPreviewOpen(true);
        
        toast({ title: "Quotation Saved", description: "The new quotation has been saved as a Rate List."});
    };

    const handleDownloadPdf = async () => {
        const input = printRef.current;
        if (!input) return;

        setIsDownloading(true);

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps= pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        const ratio = imgWidth / imgHeight;
        const finalImgWidth = pdfWidth - 20;
        const finalImgHeight = finalImgWidth / ratio;
        
        pdf.addImage(imgData, 'PNG', 10, 10, finalImgWidth, finalImgHeight);
        pdf.save(`quotation-${quotationNo}.pdf`);
        setIsDownloading(false);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label>Quotation No:</Label>
                        <p className="text-2xl font-bold text-red-600">{quotationNo}</p>
                    </div>
                    <div>
                        <Label>Quotation Date</Label>
                        <DatePicker date={quotationDate} setDate={setQuotationDate} />
                    </div>
                    <div>
                        <Label>Select Party Name</Label>
                        <Combobox options={customerOptions} value={partyName} onChange={setPartyName} placeholder="Select Party..." />
                    </div>
                     <div>
                        <Label>Default LR Type</Label>
                        <Select value={defaultLrType} onValueChange={setDefaultLrType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {bookingOptions.bookingTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quotation Items</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="p-4 border rounded-md space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>From Station</Label>
                                <Combobox options={cityOptions} value={fromStation} onChange={setFromStation} placeholder="From..."/>
                            </div>
                            <div>
                                <Label>To Station</Label>
                                <Combobox options={cityOptions} value={toStation} onChange={setToStation} placeholder="To..."/>
                            </div>
                        </div>

                        <div className="p-4 border-t border-dashed space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 items-end">
                                <div className="space-y-1">
                                    <Label>Item Name</Label>
                                    <Combobox options={itemOptions} value={itemName} onChange={setItemName} placeholder="All Items"/>
                                </div>
                                <div className="space-y-1">
                                    <Label>Description</Label>
                                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional"/>
                                </div>
                                <div className="space-y-1">
                                    <Label>Wt./Unit</Label>
                                    <Input type="number" value={wtPerUnit} onChange={(e) => setWtPerUnit(Number(e.target.value))} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Rate</Label>
                                    <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Rate On</Label>
                                    <Select value={rateOn} onValueChange={(v) => setRateOn(v as RateOnType)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Booking Type</Label>
                                    <Select value={lrType} onValueChange={(v) => setLrType(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {bookingOptions.bookingTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <Button onClick={handleAddToList} size="icon" className="h-10 w-10">
                                    <PlusCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                     </div>

                     <div className="mt-4 overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Wt./Unit</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Booking Type</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.fromStation}</TableCell>
                                        <TableCell>{item.toStation}</TableCell>
                                        <TableCell>{item.itemName}</TableCell>
                                        <TableCell>{item.wtPerUnit || 'N/A'}</TableCell>
                                        <TableCell>{item.rate} / {rateOnOptions.find(o => o.value === item.rateOn)?.label}</TableCell>
                                        <TableCell>{item.lrType}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => setItems(prev => prev.filter(p => p.id !== item.id))}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">No items added to the quotation yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Quotation Note</CardTitle></CardHeader>
                <CardContent>
                    <Textarea placeholder="Enter any additional notes for this quotation..."/>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveQuotation}>
                    <Save className="mr-2 h-4 w-4"/> Save Quotation
                </Button>
            </div>

            {savedQuotationData && (
                <Dialog open={isPreviewOpen} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        router.push('/company/master/rate-list');
                    }
                    setIsPreviewOpen(isOpen);
                }}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Quotation Saved & Ready to Print</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                            <div ref={printRef}>
                               <PrintableQuotation 
                                    quotationNo={quotationNo}
                                    quotationDate={quotationDate!}
                                    party={savedQuotationData.party}
                                    items={savedQuotationData.items}
                                    profile={companyProfile}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                             <Button variant="secondary" onClick={() => router.push('/company/master/rate-list')}>Close & Exit</Button>
                            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download PDF
                            </Button>
                            <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

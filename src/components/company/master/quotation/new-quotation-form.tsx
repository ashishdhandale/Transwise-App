
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Trash2, PlusCircle, Save } from 'lucide-react';
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

const rateOnOptions: { label: string; value: RateOnType }[] = [
    { label: 'Charge Wt.', value: 'Chg.wt' },
    { label: 'Actual Wt.', value: 'Act.wt' },
    { label: 'Quantity', value: 'Quantity' },
];

interface QuotationItem extends StationRate {
    id: number;
    itemName?: string;
    description?: string;
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
    
    // Current item entry
    const [fromStation, setFromStation] = useState<string | undefined>();
    const [toStation, setToStation] = useState<string | undefined>();
    const [itemName, setItemName] = useState<string | undefined>();
    const [description, setDescription] = useState('');
    const [rate, setRate] = useState<number | ''>('');
    const [rateOn, setRateOn] = useState<RateOnType>('Chg.wt');

    const { toast } = useToast();
    const router = useRouter();


    useEffect(() => {
        setCities(getCities());
        setMasterItems(getItems());
        setCustomers(getCustomers());
    }, []);
    
    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name, value: c.name })), [cities]);
    const itemOptions = useMemo(() => masterItems.map(i => ({ label: i.name, value: i.name })), [masterItems]);
    const customerOptions = useMemo(() => [{label: 'Default Quote', value: 'Default Quote'}, ...customers.map(c => ({ label: c.name, value: c.name }))], [customers]);

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
        };

        setItems(prev => [...prev, newItem]);
        resetEntryFields();
    };
    
    const resetEntryFields = () => {
        // Don't reset From and To station
        setItemName(undefined);
        setDescription('');
        setRate('');
        setRateOn('Chg.wt');
    }
    
    const handleSaveQuotation = () => {
        if (!partyName) {
            toast({ title: 'Party Name Required', description: 'Please select a party name for this quotation.', variant: 'destructive' });
            return;
        }

        if (items.length === 0) {
            toast({ title: 'No Items', description: 'Please add at least one item to the quotation.', variant: 'destructive' });
            return;
        }
        
        const customer = customers.find(c => c.name === partyName);
        
        const newRateList: Omit<RateList, 'id'> = {
            name: `Quotation for ${partyName} - ${new Date().toLocaleDateString()}`,
            isStandard: partyName === 'Default Quote',
            customerIds: customer ? [customer.id] : [],
            stationRates: items.map(({ fromStation, toStation, rate, rateOn }) => ({ fromStation, toStation, rate, rateOn })),
            itemRates: [], // This could be extended to support item-specific rates in the quotation form
        };

        const allRateLists = getRateLists();
        const newId = allRateLists.length > 0 ? Math.max(...allRateLists.map(rl => rl.id)) + 1 : 1;
        
        saveRateLists([...allRateLists, { id: newId, ...newRateList }]);
        
        toast({ title: "Quotation Saved", description: "The new quotation has been saved as a Rate List."});
        router.push('/company/master/rate-list');
    }

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

                        <div className="p-4 border-t border-dashed grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto_auto] gap-4 items-end">
                            <div>
                                <Label>Item Name</Label>
                                <Combobox options={itemOptions} value={itemName} onChange={setItemName} placeholder="All Items"/>
                            </div>
                             <div>
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional item description"/>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Rate</Label>
                                    <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                                </div>
                                <div>
                                    <Label>Rate On</Label>
                                    <Select value={rateOn} onValueChange={(v) => setRateOn(v as RateOnType)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleAddToList}><PlusCircle className="mr-2 h-4 w-4" /> Add Item to Route</Button>
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
                                    <TableHead>Rate</TableHead>
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
                                        <TableCell>{item.rate} / {rateOnOptions.find(o => o.value === item.rateOn)?.label}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => setItems(prev => prev.filter(p => p.id !== item.id))}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No items added to the quotation yet.</TableCell>
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
        </div>
    )
}

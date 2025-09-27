
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { City, Item, RateList, RateOnType, StationRate, ItemRate } from '@/lib/types';
import { getCities } from '@/lib/city-data';
import { getItems } from '@/lib/item-data';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { saveRateLists, getRateLists } from '@/lib/rate-list-data';
import { Input } from '@/components/ui/input';

const rateOnOptions: { label: string; value: RateOnType }[] = [
    { label: 'Chg. Wt.', value: 'Chg.wt' },
    { label: 'Act. Wt.', value: 'Act.wt' },
    { label: 'Quantity', value: 'Quantity' },
];

let nextStationRateId = 1;
let nextItemRateId = 1;

export function StandardRateListEditor() {
    const [rateList, setRateList] = useState<RateList | null>(null);
    const [stationRates, setStationRates] = useState<(StationRate & { id: number })[]>([]);
    const [itemRates, setItemRates] = useState<(ItemRate & { id: number })[]>([]);
    
    // Master data
    const [cities, setCities] = useState<City[]>([]);
    const [masterItems, setMasterItems] = useState<Item[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const allRateLists = getRateLists();
        const standardList = allRateLists.find(rl => rl.isStandard);
        
        if (standardList) {
            setRateList(standardList);
            setStationRates(standardList.stationRates.map(sr => ({ ...sr, id: nextStationRateId++ })));
            setItemRates(standardList.itemRates.map(ir => ({...ir, id: nextItemRateId++ })));
        }
        
        setCities(getCities());
        setMasterItems(getItems());
    }, []);

    const cityOptions = useMemo(() => cities.map(c => ({ label: c.name, value: c.name })), [cities]);
    const itemOptions = useMemo(() => masterItems.map(i => ({ label: i.name, value: String(i.id) })), [masterItems]);
    
    const handleAddStationRate = () => {
        setStationRates(prev => [...prev, { id: nextStationRateId++, fromStation: '', toStation: '', rate: 0, rateOn: 'Chg.wt' }]);
    };
    
    const handleAddItemRate = () => {
        setItemRates(prev => [...prev, { id: nextItemRateId++, itemId: '', rate: 0, rateOn: 'Chg.wt' }]);
    }
    
    const handleStationRateChange = (id: number, field: keyof StationRate, value: string | number) => {
        setStationRates(prev => prev.map(sr => sr.id === id ? { ...sr, [field]: value } : sr));
    };

    const handleItemRateChange = (id: number, field: keyof ItemRate, value: string | number) => {
        setItemRates(prev => prev.map(ir => ir.id === id ? { ...ir, [field]: value } : ir));
    }
    
    const handleRemoveStationRate = (id: number) => {
        setStationRates(prev => prev.filter(sr => sr.id !== id));
    };
    
    const handleRemoveItemRate = (id: number) => {
        setItemRates(prev => prev.filter(ir => ir.id !== id));
    };

    const handleSaveChanges = async () => {
        if (!rateList) return;
        setIsSubmitting(true);

        const updatedRateList: RateList = {
            ...rateList,
            stationRates: stationRates.map(({ id, ...rest }) => rest),
            itemRates: itemRates.map(({ id, ...rest}) => rest),
        };
        
        const allRateLists = getRateLists();
        const updatedLists = allRateLists.map(rl => rl.id === rateList.id ? updatedRateList : rl);
        
        saveRateLists(updatedLists);
        
        await new Promise(res => setTimeout(res, 500)); // Simulate async save
        setIsSubmitting(false);
        toast({ title: 'Success', description: 'Standard Rate List has been updated.' });
    };

    if (!rateList) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Standard Rate List</CardTitle>
                    <CardDescription>
                        No standard rate list found. Please ensure one is configured.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Station-wise Rates</CardTitle>
                    <CardDescription>
                        These are the default rates between two stations when no specific item rate or quotation applies. Edit the values directly in the rows.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From Station</TableHead>
                                    <TableHead>To Station</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Rate On</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stationRates.map((sr) => (
                                    <TableRow key={sr.id}>
                                        <TableCell><Combobox options={cityOptions} value={sr.fromStation} onChange={(val) => handleStationRateChange(sr.id, 'fromStation', val)} /></TableCell>
                                        <TableCell><Combobox options={cityOptions} value={sr.toStation} onChange={(val) => handleStationRateChange(sr.id, 'toStation', val)} /></TableCell>
                                        <TableCell><Input type="number" value={sr.rate} onChange={(e) => handleStationRateChange(sr.id, 'rate', e.target.value)} /></TableCell>
                                        <TableCell>
                                            <Select value={sr.rateOn} onValueChange={(val) => handleStationRateChange(sr.id, 'rateOn', val)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>{rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveStationRate(sr.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <Button variant="outline" size="sm" className="mt-4" onClick={handleAddStationRate}><PlusCircle className="mr-2 h-4 w-4"/>Add Station Rate</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Item-wise Rates</CardTitle>
                    <CardDescription>
                        These rates are for specific items and will override station-wise rates if applicable. Edit the values directly in the rows.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Rate On</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemRates.map((ir) => (
                                    <TableRow key={ir.id}>
                                        <TableCell>
                                            <Combobox options={itemOptions} value={ir.itemId} onChange={(val) => handleItemRateChange(ir.id, 'itemId', val)} placeholder="Select Item..." />
                                        </TableCell>
                                        <TableCell><Input type="number" value={ir.rate} onChange={(e) => handleItemRateChange(ir.id, 'rate', e.target.value)} /></TableCell>
                                        <TableCell>
                                            <Select value={ir.rateOn} onValueChange={(val) => handleItemRateChange(ir.id, 'rateOn', val)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>{rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItemRate(ir.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <Button variant="outline" size="sm" className="mt-4" onClick={handleAddItemRate}><PlusCircle className="mr-2 h-4 w-4"/>Add Item Rate</Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveChanges} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Standard Rate List
                </Button>
            </div>
        </div>
    );
}


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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Save, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RateList, RateOnType, StationRate } from '@/lib/types';
import { getRateLists, saveRateLists } from '@/lib/rate-list-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const rateOnOptions: { label: string; value: RateOnType }[] = [
    { label: 'Chg. Wt.', value: 'Chg.wt' },
    { label: 'Act. Wt.', value: 'Act.wt' },
    { label: 'Quantity', value: 'Quantity' },
    { label: 'Fixed', value: 'Fixed' },
];

const bookingTypeOptions = ['TOPAY', 'PAID', 'TBB', 'FOC'];

export function StandardRateListEditor() {
    const [rateList, setRateList] = useState<RateList | null>(null);
    const [rates, setRates] = useState<StationRate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const allLists = getRateLists();
        const standardList = allLists.find(rl => rl.isStandard);
        if (standardList) {
            setRateList(standardList);
            setRates(standardList.stationRates);
        }
        setIsLoading(false);
    }, []);

    const filteredRates = useMemo(() => {
        if (!searchTerm) return rates;
        const lowerQuery = searchTerm.toLowerCase();
        return rates.filter(rate => 
            rate.fromStation.toLowerCase().includes(lowerQuery) ||
            rate.toStation.toLowerCase().includes(lowerQuery) ||
            (rate.itemName && rate.itemName.toLowerCase().includes(lowerQuery)) ||
            (rate.senderName && rate.senderName.toLowerCase().includes(lowerQuery)) ||
            (rate.receiverName && rate.receiverName.toLowerCase().includes(lowerQuery))
        );
    }, [rates, searchTerm]);

    const handleRateChange = (index: number, field: keyof StationRate, value: any) => {
        const updatedRates = [...rates];
        const rateToUpdate = { ...updatedRates[index] };

        if (field === 'rate' || field === 'wtPerUnit') {
            (rateToUpdate[field] as number | undefined) = Number(value) || undefined;
        } else {
            (rateToUpdate[field] as any) = value;
        }
        
        updatedRates[index] = rateToUpdate;
        setRates(updatedRates);
    };

    const handleDeleteRate = (index: number) => {
        const updatedRates = rates.filter((_, i) => i !== index);
        setRates(updatedRates);
        toast({ title: 'Rate Removed', description: 'The rate has been removed from the list. Save to confirm.'});
    };

    const handleSaveChanges = () => {
        if (!rateList) return;
        setIsSaving(true);
        
        const updatedRateList = { ...rateList, stationRates: rates };
        const allLists = getRateLists();
        const updatedLists = allLists.map(rl => rl.id === updatedRateList.id ? updatedRateList : rl);

        saveRateLists(updatedLists);
        
        setTimeout(() => {
             toast({ title: 'Changes Saved', description: 'The standard rate list has been updated.' });
             setIsSaving(false);
        }, 500);
    };

    if (isLoading) {
        return <Card><CardContent><p>Loading Standard Rate List...</p></CardContent></Card>
    }

    if (!rateList) {
        return <Card><CardContent><p>Standard Rate List not found. Please contact support.</p></CardContent></Card>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Standard Rate List</CardTitle>
                <CardDescription>
                    These rates are automatically learned from bookings for customers without a specific quotation. You can manually adjust or remove them here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by station, item, or party..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
                 <div className="overflow-x-auto border rounded-md max-h-[60vh]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Sender</TableHead>
                                <TableHead>Receiver</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Wt./Unit (kg)</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Per</TableHead>
                                <TableHead>Booking Type</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRates.map((rate, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{rate.senderName || 'Any'}</TableCell>
                                    <TableCell>{rate.receiverName || 'Any'}</TableCell>
                                    <TableCell>{rate.fromStation}</TableCell>
                                    <TableCell>{rate.toStation}</TableCell>
                                    <TableCell>{rate.itemName}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            value={rate.wtPerUnit || ''} 
                                            onChange={(e) => handleRateChange(index, 'wtPerUnit', e.target.value)}
                                            className="h-8 w-24"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            value={rate.rate || ''} 
                                            onChange={(e) => handleRateChange(index, 'rate', e.target.value)}
                                            className="h-8 w-24"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select value={rate.rateOn} onValueChange={(val) => handleRateChange(index, 'rateOn', val)}>
                                            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {rateOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={rate.lrType} onValueChange={(val) => handleRateChange(index, 'lrType', val)}>
                                            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {bookingTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDeleteRate(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {filteredRates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                                        No standard rates found. They will be added automatically as you create new bookings.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    );
}

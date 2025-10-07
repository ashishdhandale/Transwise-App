
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { addDays } from 'date-fns';
import type { Booking } from '@/lib/bookings-dashboard-data';

interface DeliverySearchFiltersProps {
    onSearch: (filters: { fromDate?: Date; toDate?: Date; status?: string; toStation?: string }) => void;
    allDeliveries: Booking[];
}

const deliveryStatuses: (Booking['status'] | 'All')[] = ['All', 'In Transit', 'Delivered', 'In HOLD'];

export function DeliverySearchFilters({ onSearch, allDeliveries }: DeliverySearchFiltersProps) {
    const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
    const [toDate, setToDate] = useState<Date | undefined>(addDays(new Date(), 7));
    const [status, setStatus] = useState<string>('All');
    const [toStation, setToStation] = useState<string>('All');

    const toStationOptions = useMemo(() => {
        const stations = new Set(allDeliveries.map(d => d.toCity));
        return ['All', ...Array.from(stations)];
    }, [allDeliveries]);

    const handleSearch = () => {
        onSearch({ fromDate, toDate, status, toStation });
    };
    
    const handleReset = () => {
        setFromDate(new Date());
        setToDate(addDays(new Date(), 7));
        setStatus('All');
        setToStation('All');
        onSearch({});
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                        <Label>From Date</Label>
                        <DatePicker date={fromDate} setDate={setFromDate} />
                    </div>
                    <div className="space-y-1">
                        <Label>To Date</Label>
                        <DatePicker date={toDate} setDate={setToDate} />
                    </div>
                    <div className="space-y-1">
                        <Label>To Station</Label>
                        <Select value={toStation} onValueChange={setToStation}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {toStationOptions.map(station => (
                                    <SelectItem key={station} value={station}>{station}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Status</Label>
                         <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {deliveryStatuses.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSearch} className="w-full">Search</Button>
                        <Button onClick={handleReset} variant="outline" className="w-full">Reset</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


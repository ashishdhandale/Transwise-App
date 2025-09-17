
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { bookingOptions } from '@/lib/booking-data';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export function BookingDetailsSection() {
    const [bookingDate, setBookingDate] = useState('');

    useEffect(() => {
        setBookingDate(format(new Date(), 'dd/MM/yyyy'));
    }, []);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-1">
                <Label htmlFor="lrNo">GR Number</Label>
                <Input id="lrNo" value="WD123456" className="font-bold text-red-600 border-red-300" readOnly />
            </div>
            <div className="space-y-1">
                <Label htmlFor="bookingDate">Booking Date</Label>
                <Input id="bookingDate" value={bookingDate} readOnly />
            </div>
            <div className="space-y-1">
                <Label htmlFor="loadType">Load Type</Label>
                <Select defaultValue="PTL">
                    <SelectTrigger id="loadType">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.loadTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="fromStation">From Station</Label>
                <Select defaultValue="AHMDABAD">
                    <SelectTrigger id="fromStation">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.stations.map(station => <SelectItem key={station} value={station}>{station}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="toStation">To Station</Label>
                <div className="flex gap-1">
                    <Select defaultValue="AHMDABAD">
                        <SelectTrigger id="toStation">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                             {bookingOptions.stations.map(station => <SelectItem key={station} value={station}>{station}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button size="icon" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600">
                        <Plus className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="bookingType">Booking Type</Label>
                <Select defaultValue="FOC">
                    <SelectTrigger id="bookingType">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.bookingTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

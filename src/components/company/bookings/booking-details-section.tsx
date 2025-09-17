
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import React, { useEffect, useState } from 'react';

export function BookingDetailsSection() {
    const [bookingDate, setBookingDate] = useState('');

    useEffect(() => {
        // This will only run on the client, after the initial render,
        // preventing a hydration mismatch.
        setBookingDate(format(new Date(), 'dd/MM/yyyy'));
    }, []);
    
    const stationOptions = bookingOptions.stations.map(station => ({ label: station, value: station }));
    
    const [fromStationValue, setFromStationValue] = React.useState('Ahmedabad');
    const [toStationValue, setToStationValue] = React.useState('');


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
                <Combobox
                    options={stationOptions}
                    value={fromStationValue}
                    onChange={setFromStationValue}
                    placeholder="Select station..."
                    searchPlaceholder="Search stations..."
                    notFoundMessage="No station found."
                    addMessage="Add New City"
                    onAdd={() => alert(`Adding new city: ${fromStationValue}`)}
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="toStation">To Station</Label>
                <Combobox
                    options={stationOptions}
                    value={toStationValue}
                    onChange={setToStationValue}
                    placeholder="Select station..."
                    searchPlaceholder="Search stations..."
                    notFoundMessage="No station found."
                    addMessage="Add New City"
                    onAdd={() => alert(`Adding new city: ${toStationValue}`)}
                />
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

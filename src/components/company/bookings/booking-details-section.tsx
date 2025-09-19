
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import React, { useEffect, useState, useCallback } from 'react';
import type { City } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';


const stationOptions = bookingOptions.stations.map((station, index) => ({
    id: index,
    name: station,
    aliasCode: station.substring(0,3).toUpperCase(),
    pinCode: '000000'
}));

interface BookingDetailsSectionProps {
    bookingType: string;
    onBookingTypeChange: (type: string) => void;
    loadType: string;
    onLoadTypeChange: (type: string) => void;
    onFromStationChange: (station: City | null) => void;
    onToStationChange: (station: City | null) => void;
    fromStation: City | null;
    toStation: City | null;
    grNumber: string;
    bookingDate?: Date;
    onBookingDateChange: (date?: Date) => void;
    isEditMode: boolean;
    companyProfile: CompanyProfileFormValues | null;
    errors: { [key: string]: boolean };
}


export function BookingDetailsSection({ 
    bookingType, 
    onBookingTypeChange,
    loadType,
    onLoadTypeChange,
    onFromStationChange,
    onToStationChange,
    fromStation,
    toStation,
    grNumber,
    bookingDate,
    onBookingDateChange,
    isEditMode,
    companyProfile,
    errors,
}: BookingDetailsSectionProps) {
    const handleFromStationChange = useCallback((stationName: string) => {
        const selectedStation = stationOptions.find(s => s.name.toLowerCase() === stationName.toLowerCase()) || null;
        onFromStationChange(selectedStation);
    }, [onFromStationChange]);

    const handleToStationChange = useCallback((stationName: string) => {
        const selectedStation = stationOptions.find(s => s.name.toLowerCase() === stationName.toLowerCase()) || null;
        onToStationChange(selectedStation);
    }, [onToStationChange]);

    useEffect(() => {
        if (isEditMode || !companyProfile) return;
        
        if (companyProfile.city && !fromStation) {
            handleFromStationChange(companyProfile.city);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromStation, isEditMode, companyProfile]); 


    const errorClass = 'border-red-500 ring-2 ring-red-500/50';

    return (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-1">
                <Label htmlFor="lrNo">GR Number</Label>
                <Input id="lrNo" value={grNumber} className="font-bold text-red-600 border-red-300" readOnly />
            </div>
            <div className="space-y-1">
                <Label htmlFor="bookingDate">Booking Date</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={'outline'}
                            className={cn(
                                'w-full justify-between text-left font-normal',
                                !bookingDate && 'text-muted-foreground',
                                errors.bookingDate && errorClass
                            )}
                        >
                            {bookingDate ? format(bookingDate, 'dd/MM/yyyy') : <span>Pick a date</span>}
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={bookingDate}
                            onSelect={onBookingDateChange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-1">
                <Label htmlFor="loadType">Load Type</Label>
                <Select value={loadType} onValueChange={onLoadTypeChange}>
                    <SelectTrigger id="loadType">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.loadTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className={cn('space-y-1 rounded-md', errors.fromStation && 'ring-2 ring-red-500/50')}>
                <Label htmlFor="fromStation">From Station</Label>
                <Combobox
                    options={stationOptions.map(s => ({ label: s.name, value: s.name }))}
                    value={fromStation?.name || ''}
                    onChange={handleFromStationChange}
                    placeholder="Select station..."
                    searchPlaceholder="Search stations..."
                    notFoundMessage="No station found."
                />
            </div>
            <div className={cn('space-y-1 rounded-md', errors.toStation && 'ring-2 ring-red-500/50')}>
                <Label htmlFor="toStation">To Station</Label>
                <Combobox
                    options={stationOptions.map(s => ({ label: s.name, value: s.name }))}
                    value={toStation?.name || ''}
                    onChange={handleToStationChange}
                    placeholder="Select station..."
                    searchPlaceholder="Search stations..."
                    notFoundMessage="No station found."
                />
            </div>
             <div className="space-y-1">
                <Label htmlFor="bookingType">Booking Type</Label>
                <Select value={bookingType} onValueChange={onBookingTypeChange}>
                    <SelectTrigger id="bookingType">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bookingOptions.bookingTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
        </>
    );
}

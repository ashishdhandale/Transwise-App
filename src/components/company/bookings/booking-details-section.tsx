

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { City } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { AddCityDialog } from '../master/add-city-dialog';
import { useToast } from '@/hooks/use-toast';
import { getBookings } from '@/lib/bookings-dashboard-data';
import { ClientOnly } from '@/components/ui/client-only';
import { getCities, saveCities } from '@/lib/city-data';

interface BookingDetailsSectionProps {
    bookingType: string;
    onBookingTypeChange: (type: string) => void;
    loadType: string;
    onLoadTypeChange: (type: string) => void;
    onFromStationChange: (station: City | null) => void;
    onToStationChange: (station: City | null) => void;
    fromStation: City | null;
    toStation: City | null;
    lrNumber: string;
    onLrNumberChange: (lrNumber: string) => void;
    bookingDate?: Date;
    onBookingDateChange: (date?: Date) => void;
    isEditMode: boolean;
    isOfflineMode: boolean;
    companyProfile: CompanyProfileFormValues | null;
    errors: { [key: string]: boolean };
    isViewOnly?: boolean;
    lrNumberInputRef?: React.Ref<HTMLInputElement>;
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
    lrNumber,
    onLrNumberChange,
    bookingDate,
    onBookingDateChange,
    isEditMode,
    isOfflineMode,
    companyProfile,
    errors,
    isViewOnly = false,
    lrNumberInputRef,
}: BookingDetailsSectionProps) {
    const { toast } = useToast();
    const [allCities, setAllCities] = useState<City[]>([]);
    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const [initialCityData, setInitialCityData] = useState<Partial<City> | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const stationOptions = useMemo(() => {
        return allCities.map(c => ({ label: c.name.toUpperCase(), value: c.name }));
    }, [allCities]);

    const loadCityData = useCallback(() => {
        setAllCities(getCities());
    }, []);

    useEffect(() => {
        loadCityData();
    }, [loadCityData]);


    const getCityObjectByName = (name: string): City | null => {
        if (!name) return null;
        const foundCity = allCities.find(c => c.name.toLowerCase() === name.toLowerCase());
        // If the city is not in the master list (e.g., from an old booking),
        // create a temporary object to display its name.
        if (!foundCity) {
            return { id: 0, name: name, aliasCode: '', pinCode: ''};
        }
        return foundCity;
    };

    const handleFromStationChange = useCallback((stationName: string) => {
        onFromStationChange(getCityObjectByName(stationName));
    }, [onFromStationChange, allCities]);

    const handleToStationChange = useCallback((stationName: string) => {
        onToStationChange(getCityObjectByName(stationName));
    }, [onToStationChange, allCities]);

    const handleOpenAddCity = (query?: string) => {
        setInitialCityData(query ? { name: query } : null);
        setIsAddCityOpen(true);
    };

    const handleSaveCity = (cityData: Omit<City, 'id'>): boolean => {
        try {
            const currentCities = getCities();
            const newId = currentCities.length > 0 ? Math.max(...currentCities.map(c => c.id)) + 1 : 1;
            const newCity: City = { id: newId, ...cityData };
            const updatedCities = [newCity, ...currentCities];
            saveCities(updatedCities);
            toast({ title: 'Station Added', description: `"${cityData.name}" has been added to your master list.` });
            loadCityData(); // Refresh the city list in this component
            return true;
        } catch (error) {
            toast({ title: 'Error', description: 'Could not save new station.', variant: 'destructive'});
            return false;
        }
    };
    
    const handleDateSelect = (date?: Date) => {
        onBookingDateChange(date);
        setIsDatePickerOpen(false);
    };

    const errorClass = 'border-red-500 ring-2 ring-red-500/50';
    const isLrEditable = isOfflineMode || isEditMode;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                <div className="space-y-1">
                    <Label htmlFor="lrNo">LR Number</Label>
                    <Input 
                        ref={lrNumberInputRef}
                        id="lrNo" 
                        value={lrNumber}
                        onChange={(e) => onLrNumberChange(e.target.value)}
                        className={cn(
                            'font-bold',
                            !isLrEditable && 'text-red-600 border-red-300',
                            isLrEditable && 'text-blue-600 border-blue-300',
                            errors.lrNumber && errorClass
                        )}
                        readOnly={!isLrEditable || isViewOnly}
                        placeholder={isLrEditable ? "Enter Manual LRN" : ""}
                        autoFocus={!isEditMode}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="bookingDate">Booking Date</Label>
                     <ClientOnly>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full justify-between text-left font-normal',
                                        !bookingDate && 'text-muted-foreground',
                                        errors.bookingDate && errorClass
                                    )}
                                    disabled={isViewOnly}
                                >
                                    {bookingDate ? format(bookingDate, 'dd/MM/yyyy') : <span>Pick a date</span>}
                                    <CalendarIcon className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={bookingDate}
                                    onSelect={handleDateSelect}
                                    disabled={isViewOnly}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </ClientOnly>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="loadType">Load Type</Label>
                    <Select value={loadType} onValueChange={onLoadTypeChange} disabled={isViewOnly}>
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
                        options={stationOptions}
                        value={fromStation?.name || ''}
                        onChange={handleFromStationChange}
                        placeholder="Select station..."
                        searchPlaceholder="Search stations..."
                        notFoundMessage="No station found."
                        addMessage="Add New Station"
                        onAdd={handleOpenAddCity}
                        disabled={isViewOnly}
                        autoOpenOnFocus
                    />
                </div>
                <div className={cn('space-y-1 rounded-md', errors.toStation && 'ring-2 ring-red-500/50')}>
                    <Label htmlFor="toStation">To Station</Label>
                    <Combobox
                        options={stationOptions}
                        value={toStation?.name || ''}
                        onChange={handleToStationChange}
                        placeholder="Select station..."
                        searchPlaceholder="Search stations..."
                        notFoundMessage="No station found."
                        addMessage="Add New Station"
                        onAdd={handleOpenAddCity}
                        disabled={isViewOnly}
                        autoOpenOnFocus
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="bookingType">Booking Type</Label>
                    <Select value={bookingType} onValueChange={onBookingTypeChange} disabled={isViewOnly}>
                        <SelectTrigger id="bookingType">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {bookingOptions.bookingTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <AddCityDialog
                isOpen={isAddCityOpen}
                onOpenChange={setIsAddCityOpen}
                onSave={handleSaveCity}
                city={initialCityData}
            />
        </>
    );
}

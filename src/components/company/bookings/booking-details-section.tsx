
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { City } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { AddCityDialog } from '../master/add-city-dialog';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';
type CityListSource = 'default' | 'custom';


interface BookingDetailsSectionProps {
    bookingType: string;
    onBookingTypeChange: (type: string) => void;
    paymentMode: 'Cash' | 'Online';
    onPaymentModeChange: (mode: 'Cash' | 'Online') => void;
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
    paymentMode,
    onPaymentModeChange,
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
    const { toast } = useToast();
    const [cityListSource, setCityListSource] = useState<CityListSource>('default');
    const [stationOptions, setStationOptions] = useState<{ label: string, value: string }[]>([]);
    const [customCities, setCustomCities] = useState<City[]>([]);
    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const [initialCityData, setInitialCityData] = useState<Partial<City> | null>(null);
    const datePickerRef = useRef<HTMLButtonElement>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const loadCityData = useCallback(() => {
        try {
            const savedSource = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
            const source = savedSource || 'default';
            setCityListSource(source);

            if (source === 'custom') {
                const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
                const parsedCities: City[] = savedCities ? JSON.parse(savedCities) : [];
                setCustomCities(parsedCities);
                setStationOptions(parsedCities.map(c => ({ label: c.name, value: c.name })));
            } else {
                setStationOptions(bookingOptions.stations.map(name => ({ label: name, value: name })));
            }
        } catch (error) {
            console.error("Failed to load city data", error);
            setStationOptions(bookingOptions.stations.map(name => ({ label: name, value: name })));
        }
    }, []);

    useEffect(() => {
        loadCityData();
    }, [loadCityData]);
    
    useEffect(() => {
        if (isEditMode || !companyProfile) return;
        
        if (companyProfile.city && !fromStation) {
            const defaultStation = stationOptions.find(s => s.value.toLowerCase() === companyProfile.city.toLowerCase());
            if (defaultStation) {
                const cityObj = cityListSource === 'custom' 
                    ? customCities.find(c => c.name === defaultStation.value)
                    : { id: 0, name: defaultStation.value, aliasCode: '', pinCode: '' };
                onFromStationChange(cityObj || null);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromStation, isEditMode, companyProfile, stationOptions, customCities, cityListSource]);

    useEffect(() => {
        if (!isEditMode) {
            // We need a small timeout to allow the UI to render before focusing.
            const timer = setTimeout(() => {
                datePickerRef.current?.focus();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isEditMode]);

    const getCityObjectByName = (name: string): City | null => {
        if (cityListSource === 'custom') {
            return customCities.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
        }
        return { id: 0, name, aliasCode: name.substring(0,3).toUpperCase(), pinCode: '' };
    };

    const handleFromStationChange = useCallback((stationName: string) => {
        onFromStationChange(getCityObjectByName(stationName));
    }, [onFromStationChange, customCities, cityListSource]);

    const handleToStationChange = useCallback((stationName: string) => {
        onToStationChange(getCityObjectByName(stationName));
    }, [onToStationChange, customCities, cityListSource]);

    const handleOpenAddCity = (query?: string) => {
        if (cityListSource !== 'custom') {
            toast({
                title: 'Default List in Use',
                description: 'To add a new city, please switch to your "Custom List" in Master > City.',
                variant: 'destructive'
            });
            return;
        }
        setInitialCityData(query ? { name: query } : null);
        setIsAddCityOpen(true);
    };

    const handleSaveCity = (cityData: Omit<City, 'id'>): boolean => {
        try {
            const newId = customCities.length > 0 ? Math.max(...customCities.map(c => c.id)) + 1 : 1;
            const newCity: City = { id: newId, ...cityData };
            const updatedCities = [newCity, ...customCities];
            localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(updatedCities));
            toast({ title: 'City Added', description: `"${cityData.name}" has been added to your custom list.` });
            loadCityData(); // Refresh the city list
            return true;
        } catch (error) {
            toast({ title: 'Error', description: 'Could not save new city.', variant: 'destructive'});
            return false;
        }
    };
    
    const handleDateSelect = (date?: Date) => {
        onBookingDateChange(date);
        setIsDatePickerOpen(false); // Close the popover on selection
    };

    const errorClass = 'border-red-500 ring-2 ring-red-500/50';

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
                <div className="space-y-1">
                    <Label htmlFor="lrNo">GR Number</Label>
                    <Input id="lrNo" value={grNumber} className="font-bold text-red-600 border-red-300" readOnly />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="bookingDate">Booking Date</Label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                ref={datePickerRef}
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
                                onSelect={handleDateSelect}
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
                        options={stationOptions}
                        value={fromStation?.name || ''}
                        onChange={handleFromStationChange}
                        placeholder="Select station..."
                        searchPlaceholder="Search stations..."
                        notFoundMessage="No station found."
                        addMessage="Add New Station"
                        onAdd={handleOpenAddCity}
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
                {bookingType === 'PAID' && (
                    <div className="space-y-1">
                        <Label htmlFor="paymentMode">Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={(value) => onPaymentModeChange(value as 'Cash' | 'Online')}>
                            <SelectTrigger id="paymentMode">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Online">Online</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
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

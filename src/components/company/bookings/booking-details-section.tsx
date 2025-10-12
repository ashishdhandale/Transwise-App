

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';
type CityListSource = 'default' | 'custom';


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
}: BookingDetailsSectionProps) {
    const { toast } = useToast();
    const [cityListSource, setCityListSource] = useState<CityListSource>('default');
    const [allCustomCities, setAllCustomCities] = useState<City[]>([]);
    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const [initialCityData, setInitialCityData] = useState<Partial<City> | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const stationOptions = useMemo(() => {
        if (cityListSource === 'custom') {
            return allCustomCities.map(c => ({ label: c.name.toUpperCase(), value: c.name }));
        }
        return bookingOptions.stations.map(name => ({ label: name.toUpperCase(), value: name }));
    }, [cityListSource, allCustomCities]);

    const fromStationOptions = useMemo(() => {
        // For offline or edit modes, show all stations.
        if (isOfflineMode || isEditMode || isViewOnly) {
            return stationOptions;
        }

        // For new online bookings, only show the default station.
        if (companyProfile?.city) {
            const defaultCityName = companyProfile.city.toUpperCase();
            const defaultOption = stationOptions.find(opt => opt.label === defaultCityName);
            return defaultOption ? [defaultOption] : [];
        }

        return [];
    }, [isOfflineMode, isEditMode, isViewOnly, stationOptions, companyProfile?.city]);

    const loadCityData = useCallback(() => {
        try {
            const savedSource = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
            const source = savedSource || 'default';
            setCityListSource(source);

            if (source === 'custom') {
                const savedCitiesJSON = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
                let savedCities: City[] = savedCitiesJSON ? JSON.parse(savedCitiesJSON) : [];
                
                // Auto-sync logic
                const allBookings = getBookings();
                const bookingCities = new Set([
                    ...allBookings.map(b => b.fromCity.trim().toUpperCase()),
                    ...allBookings.map(b => b.toCity.trim().toUpperCase()),
                ]);

                const existingCustomCities = new Set(savedCities.map(c => c.name.trim().toUpperCase()));
                const missingCities = Array.from(bookingCities).filter(bc => bc && !existingCustomCities.has(bc));

                if (missingCities.length > 0) {
                    let nextId = savedCities.length > 0 ? Math.max(...savedCities.map(c => c.id)) + 1 : 1;
                    const newCityObjects: City[] = missingCities.map(name => ({
                        id: nextId++,
                        name,
                        aliasCode: name.substring(0, 3),
                        pinCode: '',
                    }));

                    const updatedCities = [...savedCities, ...newCityObjects];
                    localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(updatedCities));
                    savedCities = updatedCities; // Use the updated list immediately

                    toast({
                        title: 'Stations Synced',
                        description: `${newCityObjects.length} new station(s) were automatically added to your master list.`,
                    });
                }

                setAllCustomCities(savedCities);
            }
        } catch (error) {
            console.error("Failed to load or sync station data", error);
        }
    }, [toast]);

    useEffect(() => {
        loadCityData();
    }, [loadCityData]);
    
    useEffect(() => {
        // Prevent this effect from running in offline mode or when a station is already set.
        if (isOfflineMode || isEditMode || !companyProfile || fromStation) return;
        
        if (companyProfile.city) {
            const defaultStation = allCustomCities.find(c => c.name.toLowerCase() === companyProfile.city.toLowerCase());
            if (defaultStation) {
                onFromStationChange(defaultStation);
            } else if (bookingOptions.stations.includes(companyProfile.city)) {
                 onFromStationChange({ id: 0, name: companyProfile.city, aliasCode: '', pinCode: '' });
            }
        }
    }, [isOfflineMode, isEditMode, companyProfile, allCustomCities, onFromStationChange, fromStation]);


    const getCityObjectByName = (name: string): City | null => {
        if (!name) return null;
        if (cityListSource === 'custom') {
            return allCustomCities.find(c => c.name.toLowerCase() === name.toLowerCase()) || { id: 0, name, aliasCode: '', pinCode: ''};
        }
        return { id: 0, name, aliasCode: name.substring(0,3).toUpperCase(), pinCode: '' };
    };

    const handleFromStationChange = useCallback((stationName: string) => {
        onFromStationChange(getCityObjectByName(stationName));
    }, [onFromStationChange, allCustomCities, cityListSource]);

    const handleToStationChange = useCallback((stationName: string) => {
        onToStationChange(getCityObjectByName(stationName));
    }, [onToStationChange, allCustomCities, cityListSource]);

    const handleOpenAddCity = (query?: string) => {
        if (cityListSource !== 'custom') {
            toast({
                title: 'Default List in Use',
                description: 'To add a new station, please switch to your "Custom List" in Master > Stations.',
                variant: 'destructive'
            });
            return;
        }
        setInitialCityData(query ? { name: query } : null);
        setIsAddCityOpen(true);
    };

    const handleSaveCity = (cityData: Omit<City, 'id'>): boolean => {
        try {
            const newId = allCustomCities.length > 0 ? Math.max(...allCustomCities.map(c => c.id)) + 1 : 1;
            const newCity: City = { id: newId, ...cityData };
            const updatedCities = [newCity, ...allCustomCities];
            localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(updatedCities));
            toast({ title: 'Station Added', description: `"${cityData.name}" has been added to your custom list.` });
            loadCityData(); // Refresh the city list
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
                    {isOfflineMode ? (
                         <Input
                            placeholder="Enter From Station..."
                            value={fromStation?.name || ''}
                            onChange={(e) => handleFromStationChange(e.target.value)}
                            disabled={isViewOnly}
                        />
                    ) : (
                        <Combobox
                            options={fromStationOptions}
                            value={fromStation?.name || ''}
                            onChange={handleFromStationChange}
                            placeholder="Select station..."
                            searchPlaceholder="Search stations..."
                            notFoundMessage="No station found."
                            addMessage="Add New Station"
                            onAdd={handleOpenAddCity}
                            disabled={isViewOnly || (!isEditMode && !isViewOnly && !!companyProfile?.city)}
                            autoOpenOnFocus
                        />
                    )}
                </div>
                <div className={cn('space-y-1 rounded-md', errors.toStation && 'ring-2 ring-red-500/50')}>
                    <Label htmlFor="toStation">To Station</Label>
                    {isOfflineMode ? (
                        <Input
                            placeholder="Enter To Station..."
                            value={toStation?.name || ''}
                            onChange={(e) => handleToStationChange(e.target.value)}
                            disabled={isViewOnly}
                        />
                    ) : (
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
                    )}
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

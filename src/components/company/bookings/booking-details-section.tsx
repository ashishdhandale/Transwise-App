
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { City } from '@/lib/types';
import { AddCityDialog } from '../master/add-city-dialog';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';


const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';
const LOCAL_STORAGE_KEY_PROFILE = 'transwise_company_profile';

type CityListSource = 'default' | 'custom';

// A simple in-memory counter for the GR sequence
let grSequence = 0;

export function BookingDetailsSection() {
    const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
    const [stationOptions, setStationOptions] = useState<City[]>([]);
    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const { toast } = useToast();
    const [fromStationValue, setFromStationValue] = React.useState('Ahmedabad');
    const [toStationValue, setToStationValue] = React.useState('');
    const [grNumber, setGrNumber] = useState('');
    const [companyCode, setCompanyCode] = useState('CO');
    const hasRunInitialEffect = useRef(false);

    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                if (profile.companyCode) {
                    setCompanyCode(profile.companyCode.toUpperCase());
                }
            }
        } catch (error) {
            console.error('Failed to load company profile', error);
        }
    }, []);

    const loadStationOptions = useCallback(() => {
         try {
            const source = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
            if (source === 'custom') {
                const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
                if (savedCities) {
                    const customCities: City[] = JSON.parse(savedCities);
                    setStationOptions(customCities);
                } else {
                     setStationOptions([]); // No custom cities saved yet
                }
            } else {
                // Default case
                const defaultCities: City[] = bookingOptions.stations.map((station, index) => ({
                    id: index,
                    name: station,
                    aliasCode: station.substring(0,3).toUpperCase(),
                    pinCode: '000000'
                }));
                setStationOptions(defaultCities);
            }
        } catch (error) {
            console.error("Failed to load station options from local storage", error);
             const defaultCities: City[] = bookingOptions.stations.map((station, index) => ({
                id: index,
                name: station,
                aliasCode: station.substring(0,3).toUpperCase(),
                pinCode: '000000'
            }));
            setStationOptions(defaultCities);
        }
    }, []);

    const generateGrNumber = useCallback((stationName: string) => {
        const fromStation = stationOptions.find(s => s.name === stationName);
        const alias = fromStation ? fromStation.aliasCode : 'XXX';
        const sequence = String(++grSequence).padStart(2, '0');
        setGrNumber(`${companyCode}${alias}${sequence}`);
    }, [stationOptions, companyCode]);

    useEffect(() => {
        loadStationOptions();
    }, [loadStationOptions]);
    
     useEffect(() => {
        if (stationOptions.length > 0 && !hasRunInitialEffect.current) {
            generateGrNumber(fromStationValue);
            hasRunInitialEffect.current = true;
        }
     }, [stationOptions, fromStationValue, generateGrNumber]);

    const handleFromStationChange = (newValue: string) => {
        setFromStationValue(newValue);
        generateGrNumber(newValue);
    }


    const handleSaveCity = (cityData: Omit<City, 'id'>) => {
        try {
            const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
            const cities: City[] = savedCities ? JSON.parse(savedCities) : [];
            const newCity: City = {
                id: cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1,
                ...cityData
            };
            const updatedCities = [newCity, ...cities];
            localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(updatedCities));
            
            // Immediately update station options
            loadStationOptions();
            
            toast({ title: 'City Added', description: `"${cityData.name}" has been added to your custom list.` });
            return true; // Success
        } catch (error) {
            console.error("Failed to save new city", error);
            toast({ title: 'Error', description: 'Could not save the new city.', variant: 'destructive'});
            return false; // Failure
        }
    };

    const handleAddCity = () => {
        const source = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
        if (source === 'custom' || source === null) { // Default to custom if not set
             if (source === null) {
                localStorage.setItem(LOCAL_STORAGE_KEY_SOURCE, 'custom');
             }
             setIsAddCityOpen(true);
        } else {
            toast({
                title: 'Action Not Allowed',
                description: 'To add a new city, please switch to "Use My Custom List" in the City Master settings.',
                variant: 'destructive',
            });
        }
    };


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
                                !bookingDate && 'text-muted-foreground'
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
                            onSelect={setBookingDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
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
                    options={stationOptions.map(s => ({ label: s.name, value: s.name }))}
                    value={fromStationValue}
                    onChange={handleFromStationChange}
                    placeholder="Select station..."
                    searchPlaceholder="Search stations..."
                    notFoundMessage="No station found."
                    addMessage="Add New City"
                    onAdd={handleAddCity}
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="toStation">To Station</Label>
                <Combobox
                    options={stationOptions.map(s => ({ label: s.name, value: s.name }))}
                    value={toStationValue}
                    onChange={setToStationValue}
                    placeholder="Select station..."
                    searchPlaceholder="Search stations..."
                    notFoundMessage="No station found."
                    addMessage="Add New City"
                    onAdd={handleAddCity}
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
         <AddCityDialog
            isOpen={isAddCityOpen}
            onOpenChange={setIsAddCityOpen}
            onSave={handleSaveCity}
        />
        </>
    );
}

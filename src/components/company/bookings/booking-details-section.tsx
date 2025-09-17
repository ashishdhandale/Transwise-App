
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import React, { useEffect, useState, useCallback } from 'react';
import type { City } from '@/lib/types';
import { AddCityDialog } from '../master/add-city-dialog';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';

type CityListSource = 'default' | 'custom';


export function BookingDetailsSection() {
    const [bookingDate, setBookingDate] = useState('');
    const [stationOptions, setStationOptions] = useState<{label: string, value: string}[]>([]);
    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const { toast } = useToast();
    
    const loadStationOptions = useCallback(() => {
         try {
            const source = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
            if (source === 'custom') {
                const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
                if (savedCities) {
                    const customCities: City[] = JSON.parse(savedCities);
                    setStationOptions(customCities.map(city => ({ label: city.name, value: city.name })));
                } else {
                     setStationOptions([]); // No custom cities saved yet
                }
            } else {
                // Default case
                setStationOptions(bookingOptions.stations.map(station => ({ label: station, value: station })));
            }
        } catch (error) {
            console.error("Failed to load station options from local storage", error);
            setStationOptions(bookingOptions.stations.map(station => ({ label: station, value: station })));
        }
    }, []);

    useEffect(() => {
        setBookingDate(format(new Date(), 'dd/MM/yyyy'));
        loadStationOptions();
    }, [loadStationOptions]);
    
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


    const [fromStationValue, setFromStationValue] = React.useState('Ahmedabad');
    const [toStationValue, setToStationValue] = React.useState('');


    return (
        <>
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
                    onAdd={handleAddCity}
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

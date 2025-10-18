

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, PlusCircle, Search, RefreshCw, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bookingOptions } from '@/lib/booking-data';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { AddCityDialog } from './add-city-dialog';
import type { City } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getBookings } from '@/lib/bookings-dashboard-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

type CityListSource = 'default' | 'custom';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';

const initialCities: City[] = [];

const tdClass = "whitespace-nowrap uppercase";

export function CityManagement() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityListSource, setCityListSource] = useState<CityListSource>('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedSource = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE) as CityListSource | null;
      if (savedSource) {
        setCityListSource(savedSource);
      }

      const savedCities = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
      if (savedCities) {
        setCities(JSON.parse(savedCities));
      } else {
        setCities(initialCities);
      }
    } catch (error) {
      console.error("Failed to load station data from local storage", error);
      setCities(initialCities);
    }
  }, []);

  const handleSourceChange = (source: CityListSource) => {
    setCityListSource(source);
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SOURCE, source);
        toast({ title: 'Setting Saved', description: `Station list source set to "${source === 'default' ? 'Default List' : 'Custom List'}".` });
    } catch (error) {
        toast({ title: 'Error', description: 'Could not save setting.', variant: 'destructive'});
    }
  }

  const filteredCities = useMemo(() => {
    if (cityListSource === 'default') {
        return bookingOptions.stations
            .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((name, index) => ({
                id: index,
                name,
                aliasCode: 'N/A',
                pinCode: 'N/A'
            }));
    }
    return cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.aliasCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.pinCode.includes(searchTerm)
    );
  }, [cities, searchTerm, cityListSource]);

  const handleAddNew = () => {
    setCurrentCity(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (city: City) => {
    setCurrentCity(city);
    setIsDialogOpen(true);
  };
  
  const saveCities = (updatedCities: City[]) => {
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(updatedCities));
          setCities(updatedCities);
      } catch (error) {
           toast({ title: 'Error', description: 'Could not save stations.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedCities = cities.filter(city => city.id !== id);
    saveCities(updatedCities);
    toast({
      title: 'Station Deleted',
      description: 'The station has been removed from your custom list.',
      variant: 'destructive',
    });
  };

  const handleSave = (cityData: Omit<City, 'id'>) => {
    const isDuplicate = cities.some(
        c => c.name.toLowerCase() === cityData.name.toLowerCase() && c.id !== currentCity?.id
    );

    if (isDuplicate) {
        toast({ title: 'Duplicate Station', description: `A station named "${cityData.name}" already exists.`, variant: 'destructive' });
        return false;
    }

    let updatedCities;
    if (currentCity) {
      updatedCities = cities.map(city => (city.id === currentCity.id ? { ...city, ...cityData } : city));
      toast({ title: 'Station Updated', description: `"${cityData.name}" has been updated successfully.` });
    } else {
      const newCity: City = {
        id: cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1,
        ...cityData
      };
      updatedCities = [newCity, ...cities];
      toast({ title: 'Station Added', description: `"${cityData.name}" has been added to your custom list.` });
    }
    saveCities(updatedCities);
    return true;
  };

  const handleSyncWithBookings = () => {
    if (cityListSource !== 'custom') {
      toast({
        title: 'Action Required',
        description: 'Please switch to "Use My Custom List" to sync booking cities.',
        variant: 'destructive',
      });
      return;
    }

    const allBookings = getBookings();
    const bookingCities = new Set([
      ...allBookings.map(b => b.fromCity.trim().toUpperCase()),
      ...allBookings.map(b => b.toCity.trim().toUpperCase()),
    ]);
    
    const existingCustomCities = new Set(cities.map(c => c.name.trim().toUpperCase()));
    const missingCities = Array.from(bookingCities).filter(bc => bc && !existingCustomCities.has(bc));

    if (missingCities.length === 0) {
      toast({ title: 'No New Stations', description: 'Your master station list is already up-to-date with all booking locations.' });
      return;
    }

    let nextId = cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1;
    const newCityObjects: City[] = missingCities.map(name => ({
      id: nextId++,
      name,
      aliasCode: name.substring(0, 3), // Simple alias generation
      pinCode: '', // Pin code needs to be added manually
    }));

    const updatedCities = [...cities, ...newCityObjects];
    saveCities(updatedCities);
    
    toast({
      title: 'Sync Complete',
      description: `${newCityObjects.length} new station(s) have been added to your custom list. Please review and update their alias and pin codes.`,
    });
  };


  const isCustom = cityListSource === 'custom';

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Station List Settings</CardTitle>
             <div className="pt-4">
                <Label className="font-semibold">Station List Source</Label>
                <RadioGroup value={cityListSource} onValueChange={handleSourceChange} className="flex items-center gap-6 mt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="defaultList" />
                        <Label htmlFor="defaultList" className="font-normal">Use Default System List</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="customList" />
                        <Label htmlFor="customList" className="font-normal">Use My Custom List</Label>
                    </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">
                    Select the source for the "From" and "To" station dropdowns on the booking page.
                </p>
            </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{isCustom ? 'Manage Custom Stations' : 'Default Station List'}</h3>
            <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search stations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {isCustom && (
              <>
                <Button onClick={handleSyncWithBookings} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync with Bookings
                </Button>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Station
                </Button>
              </>
            )}
            </div>
        </div>
        <div className="overflow-x-auto border rounded-md max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>Station Name</TableHead>
                <TableHead>Alias Code</TableHead>
                <TableHead>Pin Code</TableHead>
                {isCustom && <TableHead className="w-[120px] text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city, index) => (
                <TableRow key={city.id}>
                  <TableCell className={cn(tdClass)}>{index + 1}</TableCell>
                  <TableCell className={cn(tdClass, "font-medium")}>{city.name}</TableCell>
                  <TableCell className={cn(tdClass)}>{city.aliasCode}</TableCell>
                  <TableCell className={cn(tdClass)}>{city.pinCode}</TableCell>
                  {isCustom && (
                    <TableCell className={cn(tdClass, "text-right")}>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator/>
                              <DropdownMenuItem onClick={() => handleEdit(city)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              This action cannot be undone. This will permanently delete this station from your custom list.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(city.id)}>Continue</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredCities.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No stations found.
          </div>
        )}
      </CardContent>
       <AddCityDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          city={currentCity}
        />
    </Card>
  );
}

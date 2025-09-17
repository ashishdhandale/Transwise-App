
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
import { Pencil, Trash2, PlusCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bookingOptions } from '@/lib/booking-data';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { AddCityDialog } from './add-city-dialog';
import type { City } from '@/lib/types';

type CityListSource = 'default' | 'custom';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';
const LOCAL_STORAGE_KEY_SOURCE = 'transwise_city_list_source';

const initialCities: City[] = [
    { id: 1, name: 'Nagpur', aliasCode: 'NGP', pinCode: '440001' },
    { id: 2, name: 'Pune', aliasCode: 'PUN', pinCode: '411001' },
    { id: 3, name: 'Mumbai', aliasCode: 'BOM', pinCode: '400001' },
    { id: 4, name: 'Delhi', aliasCode: 'DEL', pinCode: '110001' },
    { id: 5, name: 'Bangalore', aliasCode: 'BLR', pinCode: '560001' },
];

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
      console.error("Failed to load city data from local storage", error);
      setCities(initialCities);
    }
  }, []);

  const handleSourceChange = (source: CityListSource) => {
    setCityListSource(source);
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SOURCE, source);
        toast({ title: 'Setting Saved', description: `City list source set to "${source === 'default' ? 'Default List' : 'Custom List'}".` });
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
           toast({ title: 'Error', description: 'Could not save cities.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedCities = cities.filter(city => city.id !== id);
    saveCities(updatedCities);
    toast({
      title: 'City Deleted',
      description: 'The city has been removed from your custom list.',
      variant: 'destructive',
    });
  };

  const handleSave = (cityData: Omit<City, 'id'>) => {
    let updatedCities;
    if (currentCity) {
      // Editing existing city
      updatedCities = cities.map(city => (city.id === currentCity.id ? { ...city, ...cityData } : city));
      toast({ title: 'City Updated', description: `"${cityData.name}" has been updated successfully.` });
    } else {
      // Adding new city
      const newCity: City = {
        id: cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1,
        ...cityData
      };
      updatedCities = [newCity, ...cities];
      toast({ title: 'City Added', description: `"${cityData.name}" has been added to your custom list.` });
    }
    saveCities(updatedCities);
    return true; // Indicate success
  };

  const isCustom = cityListSource === 'custom';

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">City List Settings</CardTitle>
             <div className="pt-4">
                <Label className="font-semibold">City List Source</Label>
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
            <h3 className="text-lg font-semibold">{isCustom ? 'Manage Custom Cities' : 'Default City List'}</h3>
            <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search cities..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {isCustom && (
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New City
                </Button>
            )}
            </div>
        </div>
        <div className="overflow-x-auto border rounded-md max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>City Name</TableHead>
                <TableHead>Alias Code</TableHead>
                <TableHead>Pin Code</TableHead>
                {isCustom && <TableHead className="w-[120px] text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city, index) => (
                <TableRow key={city.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{city.aliasCode}</TableCell>
                  <TableCell>{city.pinCode}</TableCell>
                  {isCustom && (
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(city)}>
                        <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(city.id)}>
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredCities.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No cities found.
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

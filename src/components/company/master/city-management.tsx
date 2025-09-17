
'use client';

import { useState, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Pencil, Trash2, PlusCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bookingOptions } from '@/lib/booking-data';
import { Label } from '@/components/ui/label';

interface City {
  id: number;
  name: string;
  aliasCode: string;
}

const initialCities: City[] = bookingOptions.stations.map((name, index) => ({ 
    id: index + 1, 
    name,
    aliasCode: name.substring(0, 3).toUpperCase() + (index + 1)
}));

export function CityManagement() {
  const [cities, setCities] = useState<City[]>(initialCities);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [cityName, setCityName] = useState('');
  const [aliasCode, setAliasCode] = useState('');
  const { toast } = useToast();

  const filteredCities = useMemo(() => {
    return cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.aliasCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  const handleAddNew = () => {
    setCurrentCity(null);
    setCityName('');
    setAliasCode('');
    setIsDialogOpen(true);
  };

  const handleEdit = (city: City) => {
    setCurrentCity(city);
    setCityName(city.name);
    setAliasCode(city.aliasCode);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setCities(cities.filter(city => city.id !== id));
    toast({
      title: 'City Deleted',
      description: 'The city has been removed from the list.',
      variant: 'destructive',
    });
  };

  const handleSave = () => {
    if (!cityName.trim() || !aliasCode.trim()) {
      toast({ title: 'Error', description: 'City name and alias code cannot be empty.', variant: 'destructive' });
      return;
    }

    if (currentCity) {
      // Editing existing city
      setCities(cities.map(city => (city.id === currentCity.id ? { ...city, name: cityName, aliasCode: aliasCode } : city)));
      toast({ title: 'City Updated', description: `"${cityName}" has been updated successfully.` });
    } else {
      // Adding new city
      const newCity: City = {
        id: cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1,
        name: cityName,
        aliasCode: aliasCode,
      };
      setCities([newCity, ...cities]);
      toast({ title: 'City Added', description: `"${cityName}" has been added to the list.` });
    }

    setIsDialogOpen(false);
    setCurrentCity(null);
    setCityName('');
    setAliasCode('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">City List</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities or alias..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentCity ? 'Edit City' : 'Add New City'}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                 <div>
                    <Label htmlFor="city-name">City Name</Label>
                    <Input
                        id="city-name"
                        placeholder="Enter city name"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        autoFocus
                    />
                </div>
                 <div>
                    <Label htmlFor="alias-code">Alias Code</Label>
                    <Input
                        id="alias-code"
                        placeholder="Enter alias code (e.g., NGP)"
                        value={aliasCode}
                        onChange={(e) => setAliasCode(e.target.value)}
                    />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>City Name</TableHead>
                <TableHead>Alias Code</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city, index) => (
                <TableRow key={city.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{city.aliasCode}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(city)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(city.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
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
    </Card>
  );
}


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
import { Pencil, Trash2, PlusCircle, Search, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddCityDialog } from './add-city-dialog';
import type { City } from '@/lib/types';
import { cn } from '@/lib/utils';
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
import { getCities, saveCities } from '@/lib/city-data';

const tdClass = "whitespace-nowrap uppercase";

export function CityManagement() {
  const [cities, setCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCities(getCities());
  }, []);

  const filteredCities = useMemo(() => {
    return cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.aliasCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.pinCode.includes(searchTerm)
    );
  }, [cities, searchTerm]);

  const handleAddNew = () => {
    setCurrentCity(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (city: City) => {
    setCurrentCity(city);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const updatedCities = cities.filter(city => city.id !== id);
    saveCities(updatedCities);
    setCities(updatedCities);
    toast({
      title: 'Station Deleted',
      description: 'The station has been removed from your master list.',
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
      toast({ title: 'Station Added', description: `"${cityData.name}" has been added to your list.` });
    }
    saveCities(updatedCities);
    setCities(updatedCities);
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold">Manage Stations</h3>
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
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Station
            </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto border rounded-md max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>Station Name</TableHead>
                <TableHead>Alias Code</TableHead>
                <TableHead>Pin Code</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city, index) => (
                <TableRow key={city.id}>
                  <TableCell className={cn(tdClass)}>{index + 1}</TableCell>
                  <TableCell className={cn(tdClass, "font-medium")}>{city.name}</TableCell>
                  <TableCell className={cn(tdClass)}>{city.aliasCode}</TableCell>
                  <TableCell className={cn(tdClass)}>{city.pinCode}</TableCell>
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
                                              This action cannot be undone. This will permanently delete this station.
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

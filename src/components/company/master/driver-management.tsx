

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
import { Pencil, Trash2, PlusCircle, Search, Calendar, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddDriverDialog } from './add-driver-dialog';
import type { Driver } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isBefore, startOfToday } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';

const initialDrivers: Driver[] = [];

const tdClass = "whitespace-nowrap uppercase";

export function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
      if (savedDrivers) {
        setDrivers(JSON.parse(savedDrivers));
      } else {
        setDrivers(initialDrivers);
        localStorage.setItem(LOCAL_STORAGE_KEY_DRIVERS, JSON.stringify(initialDrivers));
      }
    } catch (error) {
      console.error("Failed to load driver data from local storage", error);
      setDrivers(initialDrivers);
    }
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => 
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.mobile.includes(searchTerm)
    );
  }, [drivers, searchTerm]);

  const handleAddNew = () => {
    setCurrentDriver(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setCurrentDriver(driver);
    setIsDialogOpen(true);
  };
  
  const saveDrivers = (updatedDrivers: Driver[]) => {
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY_DRIVERS, JSON.stringify(updatedDrivers));
          setDrivers(updatedDrivers);
      } catch (error) {
           toast({ title: 'Error', description: 'Could not save drivers.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedDrivers = drivers.filter(driver => driver.id !== id);
    saveDrivers(updatedDrivers);
    toast({
      title: 'Driver Deleted',
      description: 'The driver has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (driverData: Omit<Driver, 'id'>) => {
    let updatedDrivers;
    if (currentDriver) {
      updatedDrivers = drivers.map(driver => (driver.id === currentDriver.id ? { ...driver, ...driverData } : driver));
      toast({ title: 'Driver Updated', description: `"${driverData.name}" has been updated successfully.` });
    } else {
      const newDriver: Driver = {
        id: drivers.length > 0 ? Math.max(...drivers.map(c => c.id)) + 1 : 1,
        ...driverData
      };
      updatedDrivers = [newDriver, ...drivers];
      toast({ title: 'Driver Added', description: `"${driverData.name}" has been added.` });
    }
    saveDrivers(updatedDrivers);
    return true; // Indicate success
  };

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Drivers</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by name, license, mobile..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Driver
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>License Validity</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => {
                const isExpired = driver.licenseValidity && isBefore(new Date(driver.licenseValidity), startOfToday());
                return (
                    <TableRow key={driver.id}>
                        <TableCell>
                            <Avatar>
                                <AvatarImage src={driver.photo} alt={driver.name} />
                                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className={cn(tdClass, "font-medium")}>{driver.name}</TableCell>
                        <TableCell className={cn(tdClass)}>{driver.licenseNumber}</TableCell>
                        <TableCell className={cn(tdClass, isExpired ? 'text-destructive' : '')}>
                            {driver.licenseValidity ? (
                                <span className="flex items-center gap-2">
                                    {isExpired && <Calendar className="h-4 w-4" />}
                                    {format(new Date(driver.licenseValidity), 'dd-MMM-yyyy')}
                                </span>
                            ) : 'N/A'}
                        </TableCell>
                        <TableCell className={cn(tdClass)}>{driver.mobile}</TableCell>
                        <TableCell className={cn(tdClass)}>{driver.address}</TableCell>
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
                                  <DropdownMenuItem onClick={() => handleEdit(driver)}>
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
                                                  This action cannot be undone. This will permanently delete this driver.
                                              </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDelete(driver.id)}>Continue</AlertDialogAction>
                                          </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {filteredDrivers.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No drivers found.
          </div>
        )}
      </CardContent>
       <AddDriverDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          driver={currentDriver}
        />
    </Card>
  );
}

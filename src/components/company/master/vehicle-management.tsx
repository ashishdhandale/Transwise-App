
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
import { Pencil, Trash2, PlusCircle, Search, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddVehicleDialog } from './add-vehicle-dialog';
import type { VehicleMaster } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/lib/types';
import { format, isBefore, startOfToday } from 'date-fns';

const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';

const initialVehicles: VehicleMaster[] = [];

const tdClass = "whitespace-nowrap";

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleMaster | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
      if (savedVehicles) {
        setVehicles(JSON.parse(savedVehicles));
      } else {
        setVehicles(initialVehicles);
        localStorage.setItem(LOCAL_STORAGE_KEY_VEHICLES, JSON.stringify(initialVehicles));
      }
      const savedVendors = localStorage.getItem(LOCAL_STORAGE_KEY_VENDORS);
      if (savedVendors) {
          setVendors(JSON.parse(savedVendors));
      }
    } catch (error) {
      console.error("Failed to load vehicle data from local storage", error);
      setVehicles(initialVehicles);
    }
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => 
        vehicle.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.supplierName && vehicle.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [vehicles, searchTerm]);

  const handleAddNew = () => {
    setCurrentVehicle(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (vehicle: VehicleMaster) => {
    setCurrentVehicle(vehicle);
    setIsDialogOpen(true);
  };
  
  const saveVehicles = (updatedVehicles: VehicleMaster[]) => {
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY_VEHICLES, JSON.stringify(updatedVehicles));
          setVehicles(updatedVehicles);
      } catch (error) {
           toast({ title: 'Error', description: 'Could not save vehicles.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    saveVehicles(updatedVehicles);
    toast({
      title: 'Vehicle Deleted',
      description: 'The vehicle has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (vehicleData: Omit<VehicleMaster, 'id'>) => {
    let updatedVehicles;
    if (currentVehicle) {
      updatedVehicles = vehicles.map(vehicle => (vehicle.id === currentVehicle.id ? { ...vehicle, ...vehicleData } : vehicle));
      toast({ title: 'Vehicle Updated', description: `Vehicle "${vehicleData.vehicleNo}" has been updated successfully.` });
    } else {
      const newVehicle: VehicleMaster = {
        id: vehicles.length > 0 ? Math.max(...vehicles.map(c => c.id)) + 1 : 1,
        ...vehicleData
      };
      updatedVehicles = [newVehicle, ...vehicles];
      toast({ title: 'Vehicle Added', description: `Vehicle "${vehicleData.vehicleNo}" has been added.` });
    }
    saveVehicles(updatedVehicles);
    return true; // Indicate success
  };

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Vehicles</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by vehicle no, type, supplier..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Vehicle
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Capacity (Kg)</TableHead>
                <TableHead>Insurance Validity</TableHead>
                <TableHead>RC No</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                  const isExpired = vehicle.insuranceValidity && isBefore(new Date(vehicle.insuranceValidity), startOfToday());
                  return (
                    <TableRow key={vehicle.id}>
                        <TableCell className={cn(tdClass, "font-medium")}>{vehicle.vehicleNo}</TableCell>
                        <TableCell className={cn(tdClass)}>{vehicle.vehicleType}</TableCell>
                        <TableCell className={cn(tdClass)}>
                            <Badge variant={vehicle.ownerType === 'Own' ? 'default' : 'secondary'}>{vehicle.ownerType}</Badge>
                        </TableCell>
                        <TableCell className={cn(tdClass)}>{vehicle.supplierName || 'N/A'}</TableCell>
                        <TableCell className={cn(tdClass)}>{vehicle.capacity?.toLocaleString()}</TableCell>
                        <TableCell className={cn(tdClass, isExpired ? 'text-destructive' : '')}>
                           {vehicle.insuranceValidity ? (
                                <span className="flex items-center gap-2">
                                    {isExpired && <Calendar className="h-4 w-4" />}
                                    {format(new Date(vehicle.insuranceValidity), 'dd-MMM-yyyy')}
                                </span>
                            ) : 'N/A'}
                        </TableCell>
                        <TableCell className={cn(tdClass)}>{vehicle.rcNo}</TableCell>
                        <TableCell className={cn(tdClass, "text-right")}>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                            <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(vehicle.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {filteredVehicles.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No vehicles found.
          </div>
        )}
      </CardContent>
       <AddVehicleDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          vehicle={currentVehicle}
          vendors={vendors}
        />
    </Card>
  );
}

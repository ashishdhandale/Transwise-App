
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FtlDetails } from '@/lib/bookings-dashboard-data';
import { Combobox } from '@/components/ui/combobox';
import type { Driver, VehicleMaster, Vendor } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AddVehicleDialog } from '../master/add-vehicle-dialog';
import { AddDriverDialog } from '../master/add-driver-dialog';
import { AddVendorDialog } from '../master/add-vendor-dialog';

interface VehicleDetailsSectionProps {
    details: FtlDetails;
    onDetailsChange: (details: FtlDetails) => void;
    drivers: Driver[];
    vehicles: VehicleMaster[];
    vendors: Vendor[];
    onMasterDataChange: () => void;
    loadType: 'PTL' | 'FTL';
    isViewOnly?: boolean;
}

export function VehicleDetailsSection({ details, onDetailsChange, drivers, vehicles, vendors, onMasterDataChange, loadType, isViewOnly = false }: VehicleDetailsSectionProps) {
    const { toast } = useToast();
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
    const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
    const [initialVehicleData, setInitialVehicleData] = useState<Partial<VehicleMaster> | null>(null);
    const [initialDriverData, setInitialDriverData] = useState<Partial<Driver> | null>(null);
    const [initialVendorData, setInitialVendorData] = useState<Partial<Vendor> | null>(null);


    const handleChange = (field: keyof FtlDetails, value: string | number) => {
        onDetailsChange({ ...details, [field]: value });
    };

    const handleVehicleSelect = (vehicleNo: string) => {
        const vehicle = vehicles.find(v => v.vehicleNo === vehicleNo);
        const newDetails = { ...details, vehicleNo };
        if (vehicle && vehicle.ownerType === 'Supplier' && vehicle.supplierName) {
            newDetails.lorrySupplier = vehicle.supplierName;
        }
        onDetailsChange(newDetails);
    };
    
    const handleOpenAddVehicle = (query?: string) => {
        setInitialVehicleData(query ? { vehicleNo: query.toUpperCase() } : null);
        setIsAddVehicleOpen(true);
    };

    const handleOpenAddDriver = (query?: string) => {
        setInitialDriverData(query ? { name: query } : null);
        setIsAddDriverOpen(true);
    };

    const handleOpenAddVendor = (query?: string) => {
        setInitialVendorData(query ? { name: query, type: 'Vehicle Supplier' } : null);
        setIsAddVendorOpen(true);
    };

    const handleSave = (saveFunction: (data: any) => boolean, data: any, storageKey: string, successMessage: string) => {
        try {
            const savedData = localStorage.getItem(storageKey);
            const currentData = savedData ? JSON.parse(savedData) : [];
            const newId = currentData.length > 0 ? Math.max(...currentData.map((d: any) => d.id)) + 1 : 1;
            const newData = { ...data, id: newId };
            const updatedData = [newData, ...currentData];
            localStorage.setItem(storageKey, JSON.stringify(updatedData));
            toast({ title: 'Success', description: successMessage });
            onMasterDataChange();
            return true;
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save data.', variant: 'destructive' });
            return false;
        }
    };
    
    const handleSaveVehicle = (data: Omit<VehicleMaster, 'id'>) => {
        const success = handleSave(() => true, data, 'transwise_vehicles_master', `Vehicle "${data.vehicleNo}" added.`);
        if (success) {
            handleChange('vehicleNo', data.vehicleNo);
        }
        return success;
    };
    const handleSaveDriver = (data: Omit<Driver, 'id'>) => {
        const success = handleSave(() => true, data, 'transwise_drivers', `Driver "${data.name}" added.`);
        if (success) {
             handleChange('driverName', data.name);
        }
        return success;
    };
    const handleSaveVendor = (data: Omit<Vendor, 'id'>) => {
        const success = handleSave(() => true, data, 'transwise_vendors', `Vendor "${data.name}" added.`);
        if (success) {
             handleChange('lorrySupplier', data.name);
        }
        return success;
    };


    const vehicleOptions = useMemo(() => vehicles.map(v => ({ label: v.vehicleNo.toUpperCase(), value: v.vehicleNo.toUpperCase() })), [vehicles]);
    const driverOptions = useMemo(() => drivers.map(d => ({ label: d.name.toUpperCase(), value: d.name })), [drivers]);
    const supplierOptions = useMemo(() => vendors.filter(v => v.type === 'Vehicle Supplier').map(v => ({ label: v.name, value: v.name })), [vendors]);
    
    const cardTitle = loadType === 'FTL' ? 'FTL (Full Truck Load) Details' : 'Vehicle & Driver Details';

    return (
        <>
            <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="p-3">
                    <CardTitle className="text-base text-orange-700 font-headline">{cardTitle}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="vehicleNo">Vehicle No</Label>
                        <Combobox
                            options={vehicleOptions}
                            value={details.vehicleNo}
                            onChange={handleVehicleSelect}
                            placeholder="Select Vehicle..."
                            searchPlaceholder="Search vehicle..."
                            notFoundMessage="No vehicle found."
                            addMessage="Add New Vehicle"
                            onAdd={handleOpenAddVehicle}
                            disabled={isViewOnly}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="driverName">Driver Name</Label>
                         <Combobox
                            options={driverOptions}
                            value={details.driverName}
                            onChange={(val) => handleChange('driverName', val)}
                            placeholder="Select Driver..."
                            searchPlaceholder="Search driver..."
                            notFoundMessage="No driver found."
                            addMessage="Add New Driver"
                            onAdd={handleOpenAddDriver}
                            disabled={isViewOnly}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="lorrySupplier">Lorry Supplier</Label>
                         <Combobox
                            options={supplierOptions}
                            value={details.lorrySupplier}
                            onChange={(val) => handleChange('lorrySupplier', val)}
                            placeholder="Select Supplier..."
                            searchPlaceholder="Search supplier..."
                            notFoundMessage="No supplier found."
                            addMessage="Add New Supplier"
                            onAdd={handleOpenAddVendor}
                            disabled={isViewOnly}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="truckFreight">Truck Freight</Label>
                        <Input id="truckFreight" type="number" value={details.truckFreight} onChange={e => handleChange('truckFreight', parseFloat(e.target.value) || 0)} readOnly={isViewOnly} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="advance">Advance</Label>
                        <Input id="advance" type="number" value={details.advance} onChange={e => handleChange('advance', parseFloat(e.target.value) || 0)} readOnly={isViewOnly} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="commission">Deduction: Commission</Label>
                        <Input id="commission" type="number" value={details.commission} onChange={e => handleChange('commission', parseFloat(e.target.value) || 0)} readOnly={isViewOnly} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="otherDeductions">Deduction: Others</Label>
                        <Input id="otherDeductions" type="number" value={details.otherDeductions} onChange={e => handleChange('otherDeductions', parseFloat(e.target.value) || 0)} readOnly={isViewOnly} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="balance">Balance</Label>
                        <Input id="balance" type="number" value={details.truckFreight - details.advance} readOnly className="font-bold bg-muted" />
                    </div>
                </CardContent>
            </Card>
            <AddVehicleDialog 
                isOpen={isAddVehicleOpen} 
                onOpenChange={setIsAddVehicleOpen} 
                onSave={handleSaveVehicle} 
                vendors={vendors}
                vehicle={initialVehicleData}
            />
            <AddDriverDialog 
                isOpen={isAddDriverOpen} 
                onOpenChange={setIsAddDriverOpen} 
                onSave={handleSaveDriver}
                driver={initialDriverData}
            />
            <AddVendorDialog 
                isOpen={isAddVendorOpen} 
                onOpenChange={setIsAddVendorOpen} 
                onSave={handleSaveVendor} 
                vendor={initialVendorData}
            />
        </>
    );
}


'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { VehicleMaster, Vendor, VehicleOwnerType } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';

interface AddVehicleDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (vehicleData: Omit<VehicleMaster, 'id'>) => boolean;
    vehicle?: VehicleMaster | null;
    vendors: Vendor[];
}

export function AddVehicleDialog({ isOpen, onOpenChange, onSave, vehicle, vendors }: AddVehicleDialogProps) {
    const [vehicleNo, setVehicleNo] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [ownerType, setOwnerType] = useState<VehicleOwnerType>('Own');
    const [supplierName, setSupplierName] = useState<string | undefined>(undefined);
    const [rcNo, setRcNo] = useState('');
    const [insuranceNo, setInsuranceNo] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (vehicle) {
            setVehicleNo(vehicle.vehicleNo);
            setVehicleType(vehicle.vehicleType);
            setOwnerType(vehicle.ownerType);
            setSupplierName(vehicle.supplierName);
            setRcNo(vehicle.rcNo);
            setInsuranceNo(vehicle.insuranceNo);
        } else {
            setVehicleNo('');
            setVehicleType('');
            setOwnerType('Own');
            setSupplierName(undefined);
            setRcNo('');
            setInsuranceNo('');
        }
    }, [vehicle, isOpen]);

    const handleSave = () => {
        if (!vehicleNo.trim() || !vehicleType.trim() || !rcNo.trim()) {
            toast({ title: 'Validation Error', description: 'Vehicle No, Type, and RC No are required.', variant: 'destructive' });
            return;
        }
        if (ownerType === 'Supplier' && !supplierName) {
            toast({ title: 'Validation Error', description: 'Please select a supplier.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            vehicleNo,
            vehicleType,
            ownerType,
            supplierName: ownerType === 'Supplier' ? supplierName : undefined,
            rcNo,
            insuranceNo,
        });

        if (success) {
            onOpenChange(false);
        }
    };
    
    const supplierOptions = vendors
        .filter(v => v.type === 'Vehicle Supplier')
        .map(v => ({ label: v.name, value: v.name }));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="vehicle-no">Vehicle Number</Label>
                        <Input id="vehicle-no" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} autoFocus />
                    </div>
                    <div>
                        <Label htmlFor="vehicle-type">Vehicle Type</Label>
                        <Input id="vehicle-type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="e.g., Truck, Trailer, Van" />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Owner</Label>
                        <RadioGroup value={ownerType} onValueChange={(v) => setOwnerType(v as VehicleOwnerType)} className="flex items-center gap-4 mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Own" id="own" />
                                <Label htmlFor="own">Own</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Supplier" id="supplier" />
                                <Label htmlFor="supplier">From Supplier</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {ownerType === 'Supplier' && (
                        <div className="md:col-span-2">
                            <Label htmlFor="supplier-name">Supplier Name</Label>
                            <Combobox
                                options={supplierOptions}
                                value={supplierName}
                                onChange={setSupplierName}
                                placeholder="Select a supplier..."
                                searchPlaceholder="Search suppliers..."
                                notFoundMessage="No vehicle suppliers found in Vendor Master."
                            />
                        </div>
                    )}
                    <div>
                        <Label htmlFor="rc-no">RC Number</Label>
                        <Input id="rc-no" value={rcNo} onChange={(e) => setRcNo(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="insurance-no">Insurance Policy No</Label>
                        <Input id="insurance-no" value={insuranceNo} onChange={(e) => setInsuranceNo(e.target.value)} />
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
    );
}

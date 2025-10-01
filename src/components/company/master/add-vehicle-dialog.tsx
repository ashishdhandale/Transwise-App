
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface AddVehicleDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (vehicleData: Omit<VehicleMaster, 'id'>) => boolean;
    vehicle?: Partial<VehicleMaster> | null;
    vendors: Vendor[];
}

const DatePickerField = ({ label, value, onSelect }: { label: string; value?: Date; onSelect: (date?: Date) => void }) => (
    <div>
        <Label>{label}</Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    </div>
);


export function AddVehicleDialog({ isOpen, onOpenChange, onSave, vehicle, vendors }: AddVehicleDialogProps) {
    const [vehicleNo, setVehicleNo] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [ownerType, setOwnerType] = useState<VehicleOwnerType>('Own');
    const [supplierName, setSupplierName] = useState<string | undefined>(undefined);
    const [rcNo, setRcNo] = useState('');
    const [capacity, setCapacity] = useState<number | ''>('');
    const [permitDetails, setPermitDetails] = useState('');
    const [insuranceValidity, setInsuranceValidity] = useState<Date | undefined>();
    const [fitnessCertificateValidity, setFitnessCertificateValidity] = useState<Date | undefined>();
    const [pucValidity, setPucValidity] = useState<Date | undefined>();
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (vehicle) {
                setVehicleNo(vehicle.vehicleNo || '');
                setVehicleType(vehicle.vehicleType || '');
                setOwnerType(vehicle.ownerType || 'Own');
                setSupplierName(vehicle.supplierName || undefined);
                setRcNo(vehicle.rcNo || '');
                setCapacity(vehicle.capacity || '');
                setPermitDetails(vehicle.permitDetails || '');
                setInsuranceValidity(vehicle.insuranceValidity ? new Date(vehicle.insuranceValidity) : undefined);
                setFitnessCertificateValidity(vehicle.fitnessCertificateValidity ? new Date(vehicle.fitnessCertificateValidity) : undefined);
                setPucValidity(vehicle.pucValidity ? new Date(vehicle.pucValidity) : undefined);
            } else {
                // Reset form
                setVehicleNo('');
                setVehicleType('');
                setOwnerType('Own');
                setSupplierName(undefined);
                setRcNo('');
                setCapacity('');
                setPermitDetails('');
                setInsuranceValidity(undefined);
                setFitnessCertificateValidity(undefined);
                setPucValidity(undefined);
            }
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
            capacity: Number(capacity) || 0,
            insuranceValidity: insuranceValidity?.toISOString(),
            fitnessCertificateValidity: fitnessCertificateValidity?.toISOString(),
            pucValidity: pucValidity?.toISOString(),
            permitDetails
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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{vehicle && 'id' in vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="vehicle-no">Vehicle Number</Label>
                        <Input id="vehicle-no" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} autoFocus placeholder="e.g. MH31CQ1234" />
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
                        <Label htmlFor="capacity">Capacity (in Kg)</Label>
                        <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
                    </div>
                    
                    <DatePickerField label="Insurance Validity" value={insuranceValidity} onSelect={setInsuranceValidity} />
                    <DatePickerField label="Fitness Validity" value={fitnessCertificateValidity} onSelect={setFitnessCertificateValidity} />
                    <DatePickerField label="PUC Validity" value={pucValidity} onSelect={setPucValidity} />
                    
                    <div className="md:col-span-2">
                        <Label htmlFor="permit-details">Permit Details</Label>
                        <Textarea id="permit-details" value={permitDetails} onChange={(e) => setPermitDetails(e.target.value)} placeholder="e.g., All India Permit, National Permit" />
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

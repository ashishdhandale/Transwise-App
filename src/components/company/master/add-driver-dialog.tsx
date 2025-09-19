
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
import type { Driver } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface AddDriverDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (driverData: Omit<Driver, 'id'>) => boolean;
    driver?: Driver | null;
}

export function AddDriverDialog({ isOpen, onOpenChange, onSave, driver }: AddDriverDialogProps) {
    const [name, setName] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (driver) {
            setName(driver.name);
            setLicenseNumber(driver.licenseNumber);
            setMobile(driver.mobile);
            setAddress(driver.address);
        } else {
            setName('');
            setLicenseNumber('');
            setMobile('');
            setAddress('');
        }
    }, [driver, isOpen]);


    const handleSave = () => {
        if (!name.trim() || !licenseNumber.trim() || !mobile.trim()) {
            toast({ title: 'Validation Error', description: 'Name, License Number, and Mobile are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            licenseNumber,
            mobile,
            address,
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="driver-name">Driver Name</Label>
                        <Input id="driver-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="license-number">License Number</Label>
                        <Input id="license-number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="mobile">Mobile No.</Label>
                        <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
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

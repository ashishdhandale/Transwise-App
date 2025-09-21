
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
import type { Vendor, VendorType } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddVendorDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (vendorData: Omit<Vendor, 'id'>) => boolean;
    vendor?: Partial<Vendor> | null;
}

const vendorTypes: VendorType[] = [
    'Vehicle Supplier', 
    'Freight Forwarder',
    'Delivery Agent', 
    'Booking Agent', 
];

export function AddVendorDialog({ isOpen, onOpenChange, onSave, vendor }: AddVendorDialogProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<VendorType>('Vehicle Supplier');
    const [address, setAddress] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [openingBalance, setOpeningBalance] = useState<number | ''>('');

    const { toast } = useToast();

    useEffect(() => {
        if (vendor) {
            setName(vendor.name || '');
            setType(vendor.type || 'Vehicle Supplier');
            setAddress(vendor.address || '');
            setMobile(vendor.mobile || '');
            setEmail(vendor.email || '');
            setOpeningBalance(vendor.openingBalance || 0);
        } else {
            setName('');
            setType('Vehicle Supplier');
            setAddress('');
            setMobile('');
            setEmail('');
            setOpeningBalance(0);
        }
    }, [vendor, isOpen]);


    const handleSave = () => {
        if (!name.trim() || !address.trim() || !mobile.trim()) {
            toast({ title: 'Validation Error', description: 'Vendor Name, Address, and Mobile Number are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            type,
            address,
            mobile,
            email,
            openingBalance: Number(openingBalance) || 0,
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{vendor && 'id' in vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="vendor-name">Vendor Name</Label>
                        <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="vendor-type">Vendor Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as VendorType)}>
                            <SelectTrigger id="vendor-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {vendorTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="mobile">Mobile No.</Label>
                        <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="opening-balance">Opening Balance</Label>
                        <Input id="opening-balance" type="number" value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value))} />
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

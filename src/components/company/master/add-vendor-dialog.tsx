
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
import { Separator } from '@/components/ui/separator';

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
    const [gstin, setGstin] = useState('');
    const [pan, setPan] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNo, setAccountNo] = useState('');
    const [ifscCode, setIfscCode] = useState('');


    const { toast } = useToast();

    useEffect(() => {
        if (vendor) {
            setName(vendor.name || '');
            setType(vendor.type || 'Vehicle Supplier');
            setAddress(vendor.address || '');
            setMobile(vendor.mobile || '');
            setEmail(vendor.email || '');
            setOpeningBalance(vendor.openingBalance || 0);
            setGstin(vendor.gstin || '');
            setPan(vendor.pan || '');
            setBankName(vendor.bankName || '');
            setAccountNo(vendor.accountNo || '');
            setIfscCode(vendor.ifscCode || '');
        } else {
            setName('');
            setType('Vehicle Supplier');
            setAddress('');
            setMobile('');
            setEmail('');
            setOpeningBalance(0);
            setGstin('');
            setPan('');
            setBankName('');
            setAccountNo('');
            setIfscCode('');
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
            gstin,
            pan,
            bankName,
            accountNo,
            ifscCode
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{vendor && 'id' in vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
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

                    <div className="md:col-span-2"><Separator className="my-2" /></div>
                    
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-base">Financial Details</h3>
                    </div>

                     <div>
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="pan">PAN</Label>
                        <Input id="pan" value={pan} onChange={(e) => setPan(e.target.value)} />
                    </div>
                    
                    <div className="md:col-span-2">
                        <h4 className="font-medium text-sm mt-2">Bank Details</h4>
                    </div>
                     <div>
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input id="bank-name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="account-no">Account Number</Label>
                        <Input id="account-no" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="ifsc-code">IFSC Code</Label>
                        <Input id="ifsc-code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
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

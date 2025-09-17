
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
import type { Customer } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddCustomerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (customerData: Omit<Customer, 'id'>) => boolean;
    customer?: Customer | null;
}

export function AddCustomerDialog({ isOpen, onOpenChange, onSave, customer }: AddCustomerDialogProps) {
    const [name, setName] = useState('');
    const [gstin, setGstin] = useState('');
    const [address, setAddress] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState<Customer['type']>('Company');

    const { toast } = useToast();

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setGstin(customer.gstin);
            setAddress(customer.address);
            setMobile(customer.mobile);
            setEmail(customer.email);
            setType(customer.type);
        } else {
            setName('');
            setGstin('');
            setAddress('');
            setMobile('');
            setEmail('');
            setType('Company');
        }
    }, [customer, isOpen]);


    const handleSave = () => {
        if (!name.trim() || !mobile.trim() || !email.trim()) {
            toast({ title: 'Error', description: 'Name, Mobile, and Email are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            gstin,
            address,
            mobile,
            email,
            type,
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="customer-type">Customer Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as Customer['type'])}>
                            <SelectTrigger id="customer-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Company">Company</SelectItem>
                                <SelectItem value="Individual">Individual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="mobile">Mobile No.</Label>
                        <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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


'use client';

import { useState, useEffect, useMemo } from 'react';
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
import type { Customer, CustomerType, City } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCities } from '@/lib/city-data';
import { Combobox } from '@/components/ui/combobox';

interface AddCustomerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (customerData: Omit<Customer, 'id'>) => boolean;
    customer?: Partial<Customer> | null;
}

const customerTypes: CustomerType[] = [
    'Company', 
    'Individual', 
    'Commission Agent', 
    'Booking Agent', 
    'Delivery Agent', 
    'Freight Forwarder',
    'Consignor / Consignee',
    'Agency',
];

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function AddCustomerDialog({ isOpen, onOpenChange, onSave, customer }: AddCustomerDialogProps) {
    const [name, setName] = useState('');
    const [gstin, setGstin] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState<CustomerType>('Company');
    const [openingBalance, setOpeningBalance] = useState<number | ''>('');
    const [masterCities, setMasterCities] = useState<City[]>([]);

    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setMasterCities(getCities());
            if (customer) {
                setName(customer.name || '');
                setGstin(customer.gstin || '');
                setAddress(customer.address || '');
                setCity(customer.city || '');
                setState(customer.state || '');
                setMobile(customer.mobile || '');
                setEmail(customer.email || '');
                setType(customer.type || 'Company');
                setOpeningBalance(customer.openingBalance || 0);
            } else {
                setName('');
                setGstin('');
                setAddress('');
                setCity('');
                setState('');
                setMobile('');
                setEmail('');
                setType('Company');
                setOpeningBalance(0);
            }
        }
    }, [customer, isOpen]);


    const handleSave = () => {
        if (!name.trim() || !address.trim() || !mobile.trim()) {
            toast({ title: 'Validation Error', description: 'Customer Name, Address, and Mobile Number are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            gstin,
            address,
            city,
            state,
            mobile,
            email,
            type,
            openingBalance: Number(openingBalance) || 0,
        });

        if (success) {
            onOpenChange(false);
        }
    };
    
    const cityOptions = useMemo(() => masterCities.map(c => ({ label: c.name, value: c.name })), [masterCities]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{customer && 'id' in customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="customer-type">Customer Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as CustomerType)}>
                            <SelectTrigger id="customer-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {customerTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
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
                        <Label htmlFor="city">City</Label>
                        <Combobox
                            options={cityOptions}
                            value={city}
                            onChange={setCity}
                            placeholder="Select city..."
                            searchPlaceholder="Search stations..."
                            notFoundMessage="No station found in master."
                        />
                    </div>
                     <div>
                        <Label htmlFor="state">State</Label>
                        <Select value={state} onValueChange={setState}>
                            <SelectTrigger id="state">
                                <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent>
                                {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="mobile">Mobile No.</Label>
                        <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    </div>
                     <div>
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

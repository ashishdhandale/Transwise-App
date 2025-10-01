
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
import type { Branch } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddBranchDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (branchData: Omit<Branch, 'id' | 'companyId'>) => boolean;
    branch?: Partial<Branch> | null;
}

export function AddBranchDialog({ isOpen, onOpenChange, onSave, branch }: AddBranchDialogProps) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [gstin, setGstin] = useState('');
    
    const { toast } = useToast();

    useEffect(() => {
        if (branch) {
            setName(branch.name || '');
            setAddress(branch.address || '');
            setCity(branch.city || '');
            setState(branch.state || '');
            setContactNo(branch.contactNo || '');
            setEmail(branch.email || '');
            setGstin(branch.gstin || '');
        } else {
            setName('');
            setAddress('');
            setCity('');
            setState('');
            setContactNo('');
            setEmail('');
            setGstin('');
        }
    }, [branch, isOpen]);

    const handleSave = () => {
        if (!name.trim() || !address.trim() || !city.trim() || !state.trim()) {
            toast({ title: 'Validation Error', description: 'Branch Name, Address, City, and State are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            location: `${city}, ${state}`, // Combine for backward compatibility
            address,
            city,
            state,
            contactNo,
            email,
            gstin
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{branch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="branch-name">Branch Name</Label>
                        <Input id="branch-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="city">City</Label>
                         <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="state">State</Label>
                        <Select value={state} onValueChange={setState}>
                            <SelectTrigger id="state">
                                <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MAHARASHTRA">MAHARASHTRA</SelectItem>
                                <SelectItem value="CHHATTISGARH">CHHATTISGARH</SelectItem>
                                <SelectItem value="KARNATAKA">KARNATAKA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input id="contact" value={contactNo} onChange={(e) => setContactNo(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="gstin">Branch GSTIN (if applicable)</Label>
                        <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} />
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

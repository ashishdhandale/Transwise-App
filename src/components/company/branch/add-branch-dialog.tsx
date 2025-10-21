
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Branch, BranchType, City } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCities } from '@/lib/city-data';
import { Combobox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { Copy } from 'lucide-react';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { getBranches } from '@/lib/branch-data';

interface AddBranchDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (branchData: Partial<Omit<Branch, 'id' | 'companyId'>>) => boolean;
    branch?: Partial<Branch> | null;
}

const branchTypes: BranchType[] = ['Owned', 'Agency'];

const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

const generateBranchId = (
    companyName: string,
    station: string,
    type: BranchType,
    allBranches: Branch[]
): string => {
    if (!companyName || !station || !type) return '';

    const companyInitials = companyName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 3);

    const stationCode = station.substring(0, 3).toUpperCase();
    const typeCode = type === 'Agency' ? 'AG' : 'OW';
    
    const branchesInStation = allBranches.filter(b => b.city.toLowerCase() === station.toLowerCase()).length;
    const sequenceNumber = String(branchesInStation + 1).padStart(2, '0');

    return `${companyInitials}${stationCode}${typeCode}${sequenceNumber}`;
};

export function AddBranchDialog({ isOpen, onOpenChange, onSave, branch }: AddBranchDialogProps) {
    const [branchId, setBranchId] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<BranchType>('Owned');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [gstin, setGstin] = useState('');
    const [lrPrefix, setLrPrefix] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [masterCities, setMasterCities] = useState<City[]>([]);
    const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);
    const [allBranches, setAllBranches] = useState<Branch[]>([]);
    
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            async function loadData() {
                setMasterCities(getCities());
                const profile = await loadCompanySettingsFromStorage();
                setCompanyProfile(profile);
                setAllBranches(getBranches());

                if (branch) {
                    setBranchId(branch.branchId || '');
                    setName(branch.name || '');
                    setType(branch.type || 'Owned');
                    setAddress(branch.address || '');
                    setCity(branch.city || '');
                    setState(branch.state || '');
                    setContactNo(branch.contactNo || '');
                    setEmail(branch.email || '');
                    setGstin(branch.gstin || '');
                    setLrPrefix(branch.lrPrefix || '');
                    setUsername(branch.username || '');
                    setPassword(''); // Always clear on open
                } else {
                    setName('');
                    setBranchId('');
                    setType('Owned');
                    setAddress('');
                    setCity('');
                    setState('');
                    setContactNo('');
                    setEmail('');
                    setGstin('');
                    setLrPrefix('');
                    setUsername('');
                    setPassword(generateRandomPassword());
                }
            }
            loadData();
        }
    }, [branch, isOpen]);
    
    useEffect(() => {
        if (!branch && companyProfile && city && type) { // Only for new branches
             const newBranchId = generateBranchId(companyProfile.companyName, city, type, allBranches);
             setBranchId(newBranchId);
        }
    }, [branch, city, type, companyProfile, allBranches]);


    const handleSave = () => {
        if (!name.trim() || !address.trim() || !city.trim() || !state.trim() || !branchId.trim()) {
            toast({ title: 'Validation Error', description: 'Branch ID, Name, Address, City, and State are required.', variant: 'destructive' });
            return;
        }

        const dataToSave: Partial<Omit<Branch, 'id' | 'companyId'>> = {
            branchId,
            name,
            type,
            location: `${city}, ${state}`,
            address,
            city,
            state,
            contactNo,
            email,
            gstin,
            lrPrefix,
            username: type === 'Agency' ? username : undefined,
            password: type === 'Agency' ? password : undefined,
            forcePasswordChange: type === 'Agency' && !branch,
            isActive: type === 'Agency' ? branch?.isActive ?? true : undefined,
        };
        
        if (branch && !password) {
            delete dataToSave.password;
        }

        const success = onSave(dataToSave);

        if (success) {
            onOpenChange(false);
        }
    };
    
    const cityOptions = useMemo(() => masterCities.map(c => ({ label: c.name, value: c.name })), [masterCities]);

    const copyPassword = () => {
        navigator.clipboard.writeText(password);
        toast({ title: 'Copied!', description: 'Password copied to clipboard.' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{branch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div>
                        <Label htmlFor="branch-name">Branch Name</Label>
                        <Input id="branch-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="branch-id">Branch ID</Label>
                        <Input id="branch-id" value={branchId} readOnly disabled className="font-bold bg-muted" />
                    </div>
                    <div>
                        <Label htmlFor="branch-type">Branch Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as BranchType)}>
                            <SelectTrigger id="branch-type">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {branchTypes.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="lr-prefix">LR Prefix</Label>
                        <Input id="lr-prefix" value={lrPrefix} onChange={(e) => setLrPrefix(e.target.value.toUpperCase())} placeholder="e.g. NGP, PUN" />
                    </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="city">City</Label>
                         <Combobox
                            options={cityOptions}
                            value={city}
                            onChange={setCity}
                            placeholder="Select a station..."
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

                    {type === 'Agency' && (
                        <>
                            <div className="md:col-span-2 pt-4">
                                <Separator />
                            </div>
                             <div className="md:col-span-2">
                                <h3 className="font-semibold text-base text-primary">Agency Login Details</h3>
                                <p className="text-xs text-muted-foreground">Create a separate login for this agency branch.</p>
                             </div>
                            <div>
                                <Label htmlFor="username">Login ID / Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="password">Password</Label>
                                {branch ? (
                                     <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password to change" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input id="password" type="text" value={password} readOnly className="font-mono bg-muted"/>
                                        <Button type="button" variant="outline" size="icon" onClick={copyPassword}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
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

    
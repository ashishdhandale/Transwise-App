
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface AddDriverDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (driverData: Omit<Driver, 'id'>) => boolean;
    driver?: Partial<Driver> | null;
}

export function AddDriverDialog({ isOpen, onOpenChange, onSave, driver }: AddDriverDialogProps) {
    const [name, setName] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseValidity, setLicenseValidity] = useState<Date | undefined>(undefined);
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [monthlySalary, setMonthlySalary] = useState<number | ''>('');
    const [photo, setPhoto] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (driver) {
                setName(driver.name || '');
                setLicenseNumber(driver.licenseNumber || '');
                setLicenseValidity(driver.licenseValidity ? new Date(driver.licenseValidity) : undefined);
                setMobile(driver.mobile || '');
                setAddress(driver.address || '');
                setBloodGroup(driver.bloodGroup || '');
                setMonthlySalary(driver.monthlySalary || '');
                setPhoto(driver.photo || null);
            } else {
                setName('');
                setLicenseNumber('');
                setLicenseValidity(undefined);
                setMobile('');
                setAddress('');
                setBloodGroup('');
                setMonthlySalary('');
                setPhoto(null);
            }
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
            licenseValidity: licenseValidity ? licenseValidity.toISOString() : '',
            mobile,
            address,
            bloodGroup,
            monthlySalary: Number(monthlySalary) || 0,
            photo: photo || '',
        });

        if (success) {
            onOpenChange(false);
        }
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{driver && 'id' in driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={photo || undefined} alt={name} />
                            <AvatarFallback>{name.charAt(0) || 'D'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                             <Label>Driver Photo</Label>
                             <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    Upload Photo
                                </Button>
                                {photo && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setPhoto(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                             </div>
                            <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="driver-name">Driver Name</Label>
                        <Input id="driver-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="license-number">License Number</Label>
                        <Input id="license-number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="license-validity">License Validity</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !licenseValidity && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {licenseValidity ? format(licenseValidity, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={licenseValidity}
                                    onSelect={setLicenseValidity}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="mobile">Mobile No.</Label>
                        <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={15} />
                    </div>
                     <div>
                        <Label htmlFor="blood-group">Blood Group</Label>
                        <Input id="blood-group" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="salary">Monthly Salary</Label>
                        <Input id="salary" type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} />
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

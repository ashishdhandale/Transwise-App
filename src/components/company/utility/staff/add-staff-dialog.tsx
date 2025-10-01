
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
import type { Staff, StaffRole } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const staffRoles: StaffRole[] = [
    'Manager',
    'Accountant',
    'Booking Clerk',
    'Loading Supervisor',
    'Delivery Boy',
    'Driver',
];

interface AddStaffDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (staffData: Omit<Staff, 'id'>) => boolean;
    staff?: Partial<Staff> | null;
}

export function AddStaffDialog({ isOpen, onOpenChange, onSave, staff }: AddStaffDialogProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState<StaffRole>('Booking Clerk');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [monthlySalary, setMonthlySalary] = useState<number | ''>('');
    const [joiningDate, setJoiningDate] = useState<Date | undefined>(new Date());
    const [photo, setPhoto] = useState<string>('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (staff) {
                setName(staff.name || '');
                setRole(staff.role || 'Booking Clerk');
                setMobile(staff.mobile || '');
                setAddress(staff.address || '');
                setMonthlySalary(staff.monthlySalary || '');
                setJoiningDate(staff.joiningDate ? new Date(staff.joiningDate) : new Date());
                setPhoto(staff.photo || '');
            } else {
                setName('');
                setRole('Booking Clerk');
                setMobile('');
                setAddress('');
                setMonthlySalary('');
                setJoiningDate(new Date());
                setPhoto('');
            }
        }
    }, [staff, isOpen]);


    const handleSave = () => {
        if (!name.trim() || !mobile.trim() || !joiningDate) {
            toast({ title: 'Validation Error', description: 'Name, Mobile, and Joining Date are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            role,
            mobile,
            address,
            monthlySalary: Number(monthlySalary) || 0,
            joiningDate: joiningDate.toISOString(),
            photo: photo || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/200/200`,
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
                    <DialogTitle>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={photo || undefined} alt={name} />
                            <AvatarFallback>{name.charAt(0) || 'S'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                             <Label>Staff Photo</Label>
                             <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    Upload Photo
                                </Button>
                                {photo && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setPhoto('')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                             </div>
                            <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="staff-name">Staff Name</Label>
                        <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                    <div>
                        <Label htmlFor="staff-role">Job Role</Label>
                         <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
                            <SelectTrigger id="staff-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {staffRoles.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
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
                    <div>
                        <Label htmlFor="salary">Monthly Salary</Label>
                        <Input id="salary" type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} />
                    </div>
                    <div>
                        <Label>Joining Date</Label>
                        <DatePicker date={joiningDate} setDate={setJoiningDate} />
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

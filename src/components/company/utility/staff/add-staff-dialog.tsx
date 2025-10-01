
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const staffRoles: StaffRole[] = [
    'Manager',
    'Accountant',
    'Booking Clerk',
    'Loading Supervisor',
    'Delivery Boy',
    'Driver',
];

const branches = ['Main Office', 'Pune Branch', 'Mumbai Branch'];

interface AddStaffDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (staffData: Omit<Staff, 'id'>) => boolean;
    staff?: Partial<Staff> | null;
}

export function AddStaffDialog({ isOpen, onOpenChange, onSave, staff }: AddStaffDialogProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState<StaffRole>('Booking Clerk');
    const [branch, setBranch] = useState<string>('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [monthlySalary, setMonthlySalary] = useState<number | ''>('');
    const [joiningDate, setJoiningDate] = useState<Date | undefined>(new Date());
    const [photo, setPhoto] = useState<string>('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [canAuthorizePayments, setCanAuthorizePayments] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (staff) {
                setName(staff.name || '');
                setRole(staff.role || 'Booking Clerk');
                setBranch(staff.branch || '');
                setMobile(staff.mobile || '');
                setAddress(staff.address || '');
                setMonthlySalary(staff.monthlySalary || '');
                setJoiningDate(staff.joiningDate ? new Date(staff.joiningDate) : new Date());
                setPhoto(staff.photo || '');
                setUsername(staff.username || '');
                setPassword(''); // Always clear password on open for security
                setCanAuthorizePayments(staff.canAuthorizePayments || false);
            } else {
                setName('');
                setRole('Booking Clerk');
                setBranch('');
                setMobile('');
                setAddress('');
                setMonthlySalary('');
                setJoiningDate(new Date());
                setPhoto('');
                setUsername('');
                setPassword('');
                setCanAuthorizePayments(false);
            }
        }
    }, [staff, isOpen]);


    const handleSave = () => {
        if (!name.trim() || !mobile.trim() || !joiningDate) {
            toast({ title: 'Validation Error', description: 'Name, Mobile, and Joining Date are required.', variant: 'destructive' });
            return;
        }

        const dataToSave: Omit<Staff, 'id'> = {
            name,
            role,
            branch,
            mobile,
            address,
            monthlySalary: Number(monthlySalary) || 0,
            joiningDate: joiningDate.toISOString(),
            photo: photo || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/200/200`,
            username,
            password: password, // Pass the new password, or an empty string
            canAuthorizePayments,
        };

        // If the password field is empty during an edit, we don't update it.
        // The parent `onSave` function will need to handle this logic.
        if (staff && !password) {
            delete (dataToSave as Partial<typeof dataToSave>).password;
        }


        const success = onSave(dataToSave);

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
                <div className="py-4 space-y-4">
                     <div className="flex items-center gap-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
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
                            <Label htmlFor="branch">Branch</Label>
                             <Select value={branch} onValueChange={setBranch}>
                                <SelectTrigger id="branch">
                                    <SelectValue placeholder="Select a branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map(b => (
                                        <SelectItem key={b} value={b}>{b}</SelectItem>
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
                            <Label>Joining Date</Label>
                            <DatePicker date={joiningDate} setDate={setJoiningDate} />
                        </div>
                        <div>
                            <Label htmlFor="salary">Monthly Salary</Label>
                            <Input id="salary" type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} />
                        </div>
                    </div>
                    
                    <Separator />
                    
                     <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Access & Permissions</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="username">Login ID / Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={staff ? "Enter new password to change" : "Set initial password"} />
                            </div>
                         </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="payment-auth" checked={canAuthorizePayments} onCheckedChange={setCanAuthorizePayments} />
                            <Label htmlFor="payment-auth">Allow Payment Authorization</Label>
                        </div>
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

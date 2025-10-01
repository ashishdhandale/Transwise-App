
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
import type { Staff, StaffRole, Branch, StaffPermissions } from '@/lib/types';
import { getBranches } from '@/lib/branch-data';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Copy } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const staffRoles: StaffRole[] = [
    'Manager',
    'Accountant',
    'Booking Clerk',
    'Loading Supervisor',
    'Delivery Boy',
    'Driver',
];

const idProofTypes = ['Aadhaar', 'PAN', 'Driving License'];

const permissionLabels: { id: keyof StaffPermissions; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'booking', label: 'Booking' },
  { id: 'stock', label: 'Stock' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'master', label: 'Master' },
  { id: 'reports', label: 'Reports' },
  { id: 'challan', label: 'Challan' },
  { id: 'vehicleHire', label: 'Vehicle Hire' },
  { id: 'vehicleExpense', label: 'Vehicle Expense' },
  { id: 'utility', label: 'Utility' },
];

const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

interface AddStaffDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (staffData: Partial<Omit<Staff, 'id'>>) => boolean;
    staff?: Partial<Staff> | null;
}

export function AddStaffDialog({ isOpen, onOpenChange, onSave, staff }: AddStaffDialogProps) {
    // Personal Details
    const [name, setName] = useState('');
    const [role, setRole] = useState<StaffRole>('Booking Clerk');
    const [branch, setBranch] = useState<string>('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [monthlySalary, setMonthlySalary] = useState<number | ''>('');
    const [joiningDate, setJoiningDate] = useState<Date | undefined>(new Date());
    const [photo, setPhoto] = useState<string>('');
    
    // Account Details
    const [bankName, setBankName] = useState('');
    const [accountNo, setAccountNo] = useState('');
    const [ifscCode, setIfscCode] = useState('');

    // Identification
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactNo, setEmergencyContactNo] = useState('');
    const [idProofType, setIdProofType] = useState<string | undefined>();
    const [idProofNo, setIdProofNo] = useState('');
    
    // Login Details
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const [permissions, setPermissions] = useState<StaffPermissions>({
        dashboard: true, booking: true, stock: true, accounts: true, master: true, reports: true, challan: true, vehicleHire: true, vehicleExpense: true, utility: true,
    });

    const [branches, setBranches] = useState<Branch[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setBranches(getBranches());
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
                setBankName(staff.bankName || '');
                setAccountNo(staff.accountNo || '');
                setIfscCode(staff.ifscCode || '');
                setEmergencyContactName(staff.emergencyContactName || '');
                setEmergencyContactNo(staff.emergencyContactNo || '');
                setIdProofType(staff.idProofType);
                setIdProofNo(staff.idProofNo || '');
                setPermissions(staff.permissions || { dashboard: true, booking: true, stock: true, accounts: true, master: true, reports: true, challan: true, vehicleHire: true, vehicleExpense: true, utility: true });
            } else {
                // Reset all fields for new entry
                setName('');
                setRole('Booking Clerk');
                setBranch('');
                setMobile('');
                setAddress('');
                setMonthlySalary('');
                setJoiningDate(new Date());
                setPhoto('');
                setUsername('');
                setPassword(generateRandomPassword()); // Generate password for new user
                setBankName('');
                setAccountNo('');
                setIfscCode('');
                setEmergencyContactName('');
                setEmergencyContactNo('');
                setIdProofType(undefined);
                setIdProofNo('');
                setPermissions({ dashboard: true, booking: true, stock: true, accounts: true, master: true, reports: true, challan: true, vehicleHire: true, vehicleExpense: true, utility: true });
            }
        }
    }, [staff, isOpen]);


    const handleSave = () => {
        if (!name.trim() || !mobile.trim() || !joiningDate) {
            toast({ title: 'Validation Error', description: 'Name, Mobile, and Joining Date are required.', variant: 'destructive' });
            return;
        }

        const dataToSave: Partial<Omit<Staff, 'id'>> = {
            name,
            role,
            branch,
            mobile,
            address,
            monthlySalary: Number(monthlySalary) || 0,
            joiningDate: joiningDate.toISOString(),
            photo: photo || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/200/200`,
            username,
            password,
            bankName,
            accountNo,
            ifscCode,
            emergencyContactName,
            emergencyContactNo,
            idProofType,
            idProofNo,
            permissions,
            forcePasswordChange: !staff, // Force change for new users
        };

        if (staff && !password) {
            delete dataToSave.password;
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
    
    const handlePermissionChange = (permissionId: keyof StaffPermissions, checked: boolean) => {
        setPermissions(prev => ({ ...prev, [permissionId]: checked }));
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(password);
        toast({ title: 'Copied!', description: 'Password copied to clipboard.' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Personal & Employment Details</h3>
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
                                        <SelectItem key={b.id} value={b.name}>{b.name} - {b.city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Joining Date</Label>
                            <DatePicker date={joiningDate} setDate={setJoiningDate} />
                        </div>
                        <div>
                            <Label htmlFor="salary">Monthly Salary</Label>
                            <Input id="salary" type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} />
                        </div>
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Access & Permissions</h3>
                            <div>
                                <Label htmlFor="username">Login ID / Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                {staff ? (
                                     <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password to change" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input id="password" type="text" value={password} readOnly className="font-mono bg-muted"/>
                                        <Button type="button" variant="outline" size="icon" onClick={copyPassword}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label>Module Permissions</Label>
                                <div className="p-4 border rounded-md grid grid-cols-2 gap-4">
                                    {permissionLabels.map(p => (
                                        <div key={p.id} className="flex items-center space-x-2">
                                            <Switch
                                                id={`perm-${p.id}`}
                                                checked={permissions[p.id]}
                                                onCheckedChange={(checked) => handlePermissionChange(p.id, checked)}
                                            />
                                            <Label htmlFor={`perm-${p.id}`} className="font-normal">{p.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold border-b pb-2">Contact & Identification</h3>
                         <div>
                            <Label htmlFor="mobile">Mobile No.</Label>
                            <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emergency-name">Emergency Contact Name</Label>
                                <Input id="emergency-name" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="emergency-no">Emergency Contact No.</Label>
                                <Input id="emergency-no" value={emergencyContactNo} onChange={(e) => setEmergencyContactNo(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="id-proof-type">ID Proof Type</Label>
                                 <Select value={idProofType} onValueChange={setIdProofType}>
                                    <SelectTrigger id="id-proof-type">
                                        <SelectValue placeholder="Select ID Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {idProofTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="id-proof-no">ID Proof Number</Label>
                                <Input id="id-proof-no" value={idProofNo} onChange={(e) => setIdProofNo(e.target.value)} />
                            </div>
                        </div>

                         <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Bank Account Details (for Salary)</h3>
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

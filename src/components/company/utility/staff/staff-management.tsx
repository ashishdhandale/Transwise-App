
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, PlusCircle, Search, MoreHorizontal, CheckCircle, XCircle, Copy, KeyRound, ShieldOff, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddStaffDialog } from './add-staff-dialog';
import type { Staff } from '@/lib/types';
import { getStaff, saveStaff } from '@/lib/staff-data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setStaff(getStaff());
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.mobile.includes(searchTerm)
    );
  }, [staff, searchTerm]);

  const handleAddNew = () => {
    setCurrentStaff(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (member: Staff) => {
    setCurrentStaff(member);
    setIsDialogOpen(true);
  };
  
  const saveStaff = (updatedStaff: Staff[]) => {
      try {
          localStorage.setItem('transwise_staff', JSON.stringify(updatedStaff));
          setStaff(updatedStaff);
      } catch (error) {
           toast({ title: 'Error', description: 'Could not save staff data.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedStaff = staff.filter(member => member.id !== id);
    saveStaff(updatedStaff);
    toast({
      title: 'Staff Member Deleted',
      description: 'The staff member has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (staffData: Partial<Omit<Staff, 'id'>>) => {
    let updatedStaff;
    if (currentStaff) {
        // If password is not provided in the update, keep the old one
        const finalData: Staff = {
            ...currentStaff,
            ...staffData,
            password: staffData.password ? staffData.password : currentStaff.password,
            forcePasswordChange: staffData.password ? true : currentStaff.forcePasswordChange,
            isActive: currentStaff.isActive,
        };
      updatedStaff = staff.map(member => (member.id === currentStaff.id ? finalData : member));
      toast({ title: 'Staff Member Updated', description: `"${staffData.name}" has been updated successfully.` });
    } else {
      const newStaff: Staff = {
        id: staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 1,
        name: staffData.name || '',
        role: staffData.role || 'Booking Clerk',
        mobile: staffData.mobile || '',
        address: staffData.address || '',
        monthlySalary: staffData.monthlySalary || 0,
        photo: staffData.photo || '',
        joiningDate: staffData.joiningDate || new Date().toISOString(),
        username: staffData.username,
        password: staffData.password,
        branch: staffData.branch,
        permissions: staffData.permissions || { dashboard: true, booking: true, stock: true, accounts: true, master: true, reports: true, challan: true, vehicleHire: true, vehicleExpense: true, utility: true },
        forcePasswordChange: true,
        isActive: true,
      };
      updatedStaff = [newStaff, ...staff];
      toast({ title: 'Staff Member Added', description: `"${staffData.name}" has been added.` });
    }
    saveStaff(updatedStaff);
    setStaff(updatedStaff);
    return true;
  };
  
  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast({ title: 'Copied!', description: 'Password copied to clipboard.'});
  };
  
  const handleToggleActive = (id: number) => {
      const updatedStaff = staff.map(member => {
          if (member.id === id) {
              return { ...member, isActive: !member.isActive };
          }
          return member;
      });
      saveStaff(updatedStaff);
      setStaff(updatedStaff);
      const member = staff.find(s => s.id === id);
      toast({
          title: `Account ${member?.isActive ? 'Blocked' : 'Activated'}`,
          description: `Access for ${member?.name} has been updated.`,
      });
  };

  const handleResetPassword = (id: number) => {
      const newPassword = generateRandomPassword();
      const updatedStaff = staff.map(member => {
          if (member.id === id) {
              return { ...member, password: newPassword, forcePasswordChange: true };
          }
          return member;
      });
      saveStaff(updatedStaff);
      setStaff(updatedStaff);
      const member = staff.find(s => s.id === id);
      toast({
          title: 'Password Reset',
          description: `New password for ${member?.name} is: ${newPassword}`,
          duration: 10000, // Keep toast longer for copying
      });
  };

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Staff</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, role, mobile..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={thClass}>Photo</TableHead>
                <TableHead className={thClass}>Name</TableHead>
                <TableHead className={thClass}>Login ID</TableHead>
                <TableHead className={thClass}>Password</TableHead>
                <TableHead className={thClass}>Role</TableHead>
                <TableHead className={thClass}>Branch</TableHead>
                <TableHead className={thClass}>Status</TableHead>
                <TableHead className={cn(thClass, "w-[120px] text-right")}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                        <TableCell>
                            <Avatar>
                                <AvatarImage src={member.photo} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className={cn(tdClass, "font-medium")}>{member.name}</TableCell>
                        <TableCell className={cn(tdClass)}>{member.username}</TableCell>
                        <TableCell className={cn(tdClass, 'font-mono')}>
                            {member.forcePasswordChange && member.password ? (
                                <div className="flex items-center gap-2">
                                    <span>{member.password}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyPassword(member.password!)}>
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ) : '**********'}
                        </TableCell>
                        <TableCell className={cn(tdClass)}><Badge variant="secondary">{member.role}</Badge></TableCell>
                        <TableCell className={cn(tdClass)}>{member.branch || 'N/A'}</TableCell>
                        <TableCell className={cn(tdClass)}>
                            <Badge variant={member.isActive ? 'default' : 'destructive'} className={cn(member.isActive ? 'bg-green-500' : 'bg-red-500')}>
                                {member.isActive ? 'Active' : 'Blocked'}
                            </Badge>
                        </TableCell>
                        <TableCell className={cn(tdClass, "text-right")}>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator/>
                                  <DropdownMenuItem onClick={() => handleEdit(member)}>
                                      <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handleToggleActive(member.id)}>
                                        {member.isActive ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                        {member.isActive ? 'Block Access' : 'Unblock Access'}
                                   </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handleResetPassword(member.id)}>
                                        <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                   </DropdownMenuItem>
                                  <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                                          </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                          <AlertDialogHeader>
                                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                  This will permanently delete this staff member's record.
                                              </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDelete(member.id)}>Continue</AlertDialogAction>
                                          </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredStaff.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No staff members found.
          </div>
        )}
      </CardContent>
       <AddStaffDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          staff={currentStaff}
        />
    </Card>
  );
}

    
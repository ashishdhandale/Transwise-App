

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
import { Pencil, Trash2, PlusCircle, Search, Building, Copy, Shield, ShieldOff, KeyRound, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddBranchDialog } from './add-branch-dialog';
import type { Branch, ExistingUser } from '@/lib/types';
import { getBranches, saveBranches } from '@/lib/branch-data';
import { getStaff, saveStaff } from '@/lib/staff-data';
import { cn } from '@/lib/utils';
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
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { sampleExistingUsers } from '@/lib/sample-data';


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

export function BranchDashboard() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const { toast } = useToast();
  
  // For prototype purposes, we'll assume we are logged in as the first company user.
  const [currentUser] = useState<ExistingUser | undefined>(sampleExistingUsers[0]);

  useEffect(() => {
    // Filter branches to only show those for the current user's company
    const allBranches = getBranches();
    if (currentUser) {
        setBranches(allBranches.filter(b => b.companyId === String(currentUser.id)));
    }
  }, [currentUser]);

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [branches, searchTerm]);

  const handleAddNew = () => {
    setCurrentBranch(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setCurrentBranch(branch);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const branchToDelete = branches.find(branch => branch.id === id);
    if (!branchToDelete) return;

    // Delete associated staff
    const allStaff = getStaff();
    const staffToKeep = allStaff.filter(staff => staff.branch !== branchToDelete.name);
    saveStaff(staffToKeep);

    // Delete the branch
    const allBranches = getBranches();
    const updatedBranches = allBranches.filter(branch => branch.id !== id);
    saveBranches(updatedBranches);
    // Re-filter for current user
    if(currentUser) {
        setBranches(updatedBranches.filter(b => b.companyId === String(currentUser.id)));
    }

    toast({
      title: 'Branch Deleted',
      description: `"${branchToDelete.name}" and all its associated staff have been removed.`,
      variant: 'destructive',
    });
  };

  const handleSave = (branchData: Partial<Omit<Branch, 'id' | 'companyId'>>) => {
    let updatedBranches;
    const allBranches = getBranches(); // get all branches for saving

    if (currentBranch) {
       const finalData: Branch = {
            ...currentBranch,
            ...branchData,
            password: branchData.password ? branchData.password : currentBranch.password,
            forcePasswordChange: branchData.password ? true : currentBranch.forcePasswordChange,
            isActive: branchData.type === 'Agency' ? (currentBranch.isActive ?? true) : undefined,
            branchId: branchData.branchId || currentBranch.branchId,
        };
      updatedBranches = allBranches.map(branch => (branch.id === currentBranch.id ? finalData : branch));
      toast({ title: 'Branch Updated', description: `"${branchData.name}" has been updated successfully.` });
    } else {
        if (!currentUser) {
            toast({ title: 'Error', description: 'No company context found to create a branch.', variant: 'destructive'});
            return false;
        }
      const newBranch: Branch = {
        id: `branch-${Date.now()}`,
        companyId: String(currentUser.id), // Set the correct parent company ID
        branchId: branchData.branchId || '',
        name: branchData.name || '',
        type: branchData.type || 'Owned',
        location: branchData.location || '',
        address: branchData.address || '',
        city: branchData.city || '',
        state: branchData.state || '',
        contactNo: branchData.contactNo || '',
        email: branchData.email || '',
        gstin: branchData.gstin || '',
        lrPrefix: branchData.lrPrefix,
        username: branchData.username,
        password: branchData.password,
        forcePasswordChange: branchData.forcePasswordChange,
        isActive: branchData.isActive,
      };
      updatedBranches = [newBranch, ...allBranches];
      toast({ title: 'Branch Added', description: `"${branchData.name}" has been added.` });
    }
    saveBranches(updatedBranches);
    if(currentUser) {
        setBranches(updatedBranches.filter(b => b.companyId === String(currentUser.id)));
    }
    return true;
  };

  const handleToggleActive = (id: string) => {
      const allBranches = getBranches();
      const updatedBranches = allBranches.map(branch => {
          if (branch.id === id) {
              return { ...branch, isActive: !branch.isActive };
          }
          return branch;
      });
      saveBranches(updatedBranches);
       if(currentUser) {
            setBranches(updatedBranches.filter(b => b.companyId === String(currentUser.id)));
        }
      const branch = branches.find(s => s.id === id);
      toast({
          title: `Account ${branch?.isActive ? 'Blocked' : 'Activated'}`,
          description: `Login access for ${branch?.name} has been updated.`,
      });
  };

  const handleResetPassword = (id: string) => {
      const newPassword = generateRandomPassword();
      const allBranches = getBranches();
      const updatedBranches = allBranches.map(branch => {
          if (branch.id === id) {
              return { ...branch, password: newPassword, forcePasswordChange: true };
          }
          return branch;
      });
      saveBranches(updatedBranches);
       if(currentUser) {
            setBranches(updatedBranches.filter(b => b.companyId === String(currentUser.id)));
        }
      const branch = branches.find(s => s.id === id);
      toast({
          title: 'Password Reset',
          description: `New password for ${branch?.name} is: ${newPassword}`,
          duration: 10000, // Keep toast longer for copying
      });
  };
  
  const copyToClipboard = (text?: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      toast({ title: 'Copied!'});
  }

  return (
    <>
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Building className="h-8 w-8" />
                Branch Management
            </h1>
        </header>
        <Card>
            <CardHeader>
                <div className="flex flex-row items-center justify-between pt-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        placeholder="Search by name or location..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Branch
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-md max-h-[70vh]">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className={thClass}>Branch ID</TableHead>
                        <TableHead className={thClass}>Branch Name</TableHead>
                        <TableHead className={thClass}>Type</TableHead>
                        <TableHead className={thClass}>Location</TableHead>
                        <TableHead className={thClass}>Contact</TableHead>
                        <TableHead className={thClass}>Login ID</TableHead>
                        <TableHead className={thClass}>Password</TableHead>
                        <TableHead className={cn(thClass, "w-[120px] text-right")}>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredBranches.map((branch) => (
                        <TableRow key={branch.id}>
                        <TableCell className={cn(tdClass, "font-semibold")}>{branch.branchId}</TableCell>
                        <TableCell className={cn(tdClass, "font-medium")}>{branch.name}</TableCell>
                        <TableCell className={cn(tdClass)}>
                            <Badge variant={branch.type === 'Owned' ? 'default' : 'secondary'}>{branch.type}</Badge>
                        </TableCell>
                        <TableCell className={cn(tdClass)}>{branch.city}, {branch.state}</TableCell>
                        <TableCell className={cn(tdClass)}>{branch.contactNo}</TableCell>
                        <TableCell className={cn(tdClass)}>{branch.type === 'Agency' ? branch.username : 'N/A'}</TableCell>
                         <TableCell className={cn(tdClass, 'font-mono')}>
                            {branch.type === 'Agency' && branch.forcePasswordChange && branch.password ? (
                                <div className="flex items-center gap-2">
                                    <span>{branch.password}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(branch.password)}>
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ) : branch.type === 'Agency' ? '**********' : 'N/A'}
                        </TableCell>
                        <TableCell className={cn(tdClass, "text-right")}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                               <DropdownMenuLabel>Actions for {branch.name}</DropdownMenuLabel>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem onClick={() => handleEdit(branch)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit Details
                               </DropdownMenuItem>
                               {branch.type === 'Agency' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleToggleActive(branch.id)}>
                                      {branch.isActive ?? true ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                      {branch.isActive ?? true ? 'Block Access' : 'Unblock Access'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResetPassword(branch.id)}>
                                      <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                  </DropdownMenuItem>
                                </>
                               )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                  </AlertDialogTrigger>
                                   <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this branch and all of its associated staff members.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(branch.id)}>Continue</AlertDialogAction>
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
                {filteredBranches.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No branches found.
                </div>
                )}
            </CardContent>
        </Card>
        <AddBranchDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSave={handleSave}
            branch={currentBranch}
        />
    </>
  );
}

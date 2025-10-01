
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
import { Pencil, Trash2, PlusCircle, Search, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddBranchDialog } from './add-branch-dialog';
import type { Branch } from '@/lib/types';
import { getBranches, saveBranches } from '@/lib/branch-data';
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

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap";

export function BranchDashboard() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setBranches(getBranches());
  }, []);

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
    const updatedBranches = branches.filter(branch => branch.id !== id);
    saveBranches(updatedBranches);
    setBranches(updatedBranches);
    toast({
      title: 'Branch Deleted',
      description: 'The branch has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (branchData: Omit<Branch, 'id' | 'companyId'>) => {
    let updatedBranches;
    if (currentBranch) {
      updatedBranches = branches.map(branch => (branch.id === currentBranch.id ? { ...currentBranch, ...branchData } : branch));
      toast({ title: 'Branch Updated', description: `"${branchData.name}" has been updated successfully.` });
    } else {
      const newBranch: Branch = {
        id: `branch-${Date.now()}`,
        companyId: '1', // Placeholder companyId
        ...branchData
      };
      updatedBranches = [newBranch, ...branches];
      toast({ title: 'Branch Added', description: `"${branchData.name}" has been added.` });
    }
    saveBranches(updatedBranches);
    setBranches(updatedBranches);
    return true;
  };

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
                        <TableHead className={thClass}>Branch Name</TableHead>
                        <TableHead className={thClass}>Location</TableHead>
                        <TableHead className={thClass}>Contact</TableHead>
                        <TableHead className={thClass}>Email</TableHead>
                        <TableHead className={cn(thClass, "w-[120px] text-right")}>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredBranches.map((branch) => (
                        <TableRow key={branch.id}>
                        <TableCell className={cn(tdClass, "font-medium")}>{branch.name}</TableCell>
                        <TableCell className={cn(tdClass)}>{branch.city}, {branch.state}</TableCell>
                        <TableCell className={cn(tdClass)}>{branch.contactNo}</TableCell>
                        <TableCell className={cn(tdClass)}>{branch.email}</TableCell>
                        <TableCell className={cn(tdClass, "text-right")}>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)}><Pencil className="h-4 w-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this branch.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(branch.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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


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
import { Pencil, Trash2, PlusCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddVendorDialog } from './add-vendor-dialog';
import type { Vendor } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';

const initialVendors: Vendor[] = [];

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap";

export function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedVendors = localStorage.getItem(LOCAL_STORAGE_KEY_VENDORS);
      if (savedVendors) {
        setVendors(JSON.parse(savedVendors));
      } else {
        setVendors(initialVendors);
        localStorage.setItem(LOCAL_STORAGE_KEY_VENDORS, JSON.stringify(initialVendors));
      }
    } catch (error) {
      console.error("Failed to load vendor data from local storage", error);
      setVendors(initialVendors);
    }
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.mobile.includes(searchTerm) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendors, searchTerm]);

  const handleAddNew = () => {
    setCurrentVendor(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setIsDialogOpen(true);
  };
  
  const saveVendors = (updatedVendors: Vendor[]) => {
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY_VENDORS, JSON.stringify(updatedVendors));
          setVendors(updatedVendors);
      } catch (error) {
           toast({ title: 'Error', description: 'Could not save vendors.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedVendors = vendors.filter(vendor => vendor.id !== id);
    saveVendors(updatedVendors);
    toast({
      title: 'Vendor Deleted',
      description: 'The vendor has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (vendorData: Omit<Vendor, 'id'>) => {
    let updatedVendors;
    if (currentVendor) {
      updatedVendors = vendors.map(vendor => (vendor.id === currentVendor.id ? { ...vendor, ...vendorData } : vendor));
      toast({ title: 'Vendor Updated', description: `"${vendorData.name}" has been updated successfully.` });
    } else {
      const newVendor: Vendor = {
        id: vendors.length > 0 ? Math.max(...vendors.map(c => c.id)) + 1 : 1,
        ...vendorData
      };
      updatedVendors = [newVendor, ...vendors];
      toast({ title: 'Vendor Added', description: `"${vendorData.name}" has been added.` });
    }
    saveVendors(updatedVendors);
    return true; // Indicate success
  };

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Vendors</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by name, type, mobile..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Vendor
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass}>Vendor Name</TableHead>
                  <TableHead className={thClass}>Type</TableHead>
                  <TableHead className={thClass}>Address</TableHead>
                  <TableHead className={thClass}>Mobile</TableHead>
                  <TableHead className={thClass}>Email</TableHead>
                  <TableHead className={cn(thClass, "w-[120px] text-right")}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className={cn(tdClass, "font-medium")}>
                       <Tooltip>
                        <TooltipTrigger asChild><p className="truncate max-w-[200px]">{vendor.name}</p></TooltipTrigger>
                        <TooltipContent><p>{vendor.name}</p></TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={cn(tdClass)}><Badge variant="outline">{vendor.type}</Badge></TableCell>
                    <TableCell className={cn(tdClass)}>
                       <Tooltip>
                        <TooltipTrigger asChild><p className="truncate max-w-[250px]">{vendor.address}</p></TooltipTrigger>
                        <TooltipContent><p>{vendor.address}</p></TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={cn(tdClass)}>{vendor.mobile}</TableCell>
                    <TableCell className={cn(tdClass)}>
                       <Tooltip>
                        <TooltipTrigger asChild><p className="truncate max-w-[200px]">{vendor.email}</p></TooltipTrigger>
                        <TooltipContent><p>{vendor.email}</p></TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={cn(tdClass, "text-right")}>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vendor)}>
                        <Pencil className="h-4 w-4" />
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this vendor.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(vendor.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
        {filteredVendors.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No vendors found.
          </div>
        )}
      </CardContent>
       <AddVendorDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          vendor={currentVendor}
        />
    </Card>
  );
}

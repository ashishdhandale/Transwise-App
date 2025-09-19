
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

const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';

const initialVendors: Vendor[] = [
    { id: 1, name: 'Reliable Transports', type: 'Vehicle Supplier', address: '123 Trucking Way, Nagpur', mobile: '9876501234', email: 'contact@reliable.com' },
    { id: 2, name: 'Speedy Delivery Co', type: 'Delivery Agent', address: '456 Express Lane, Pune', mobile: '9876512345', email: 'speedy@delivery.co' },
    { id: 3, name: 'Global Forwarders', type: 'Freight Forwarder', address: '789 Ocean Drive, Mumbai', mobile: '9876523456', email: 'info@global.fwd' },
];

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className={cn(tdClass, "font-medium")}>{vendor.name}</TableCell>
                  <TableCell className={cn(tdClass)}><Badge variant="outline">{vendor.type}</Badge></TableCell>
                  <TableCell className={cn(tdClass)}>{vendor.address}</TableCell>
                  <TableCell className={cn(tdClass)}>{vendor.mobile}</TableCell>
                  <TableCell className={cn(tdClass)}>{vendor.email}</TableCell>
                  <TableCell className={cn(tdClass, "text-right")}>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(vendor)}>
                      <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(vendor.id)}>
                      <Trash2 className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

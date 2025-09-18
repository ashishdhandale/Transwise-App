
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
import { AddCustomerDialog } from './add-customer-dialog';
import type { Customer } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { initialCustomers } from '@/lib/sample-data';

const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';

const tdClass = "whitespace-nowrap";

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      } else {
        // If no customers are in local storage, initialize it with the default list
        setCustomers(initialCustomers);
        localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(initialCustomers));
      }
    } catch (error) {
      console.error("Failed to load customer data from local storage", error);
      setCustomers(initialCustomers);
    }
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.gstin && customer.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.mobile && customer.mobile.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  const handleAddNew = () => {
    setCurrentCustomer(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsDialogOpen(true);
  };
  
  const saveCustomers = (updatedCustomers: Customer[]) => {
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(updatedCustomers));
          setCustomers(updatedCustomers);
      } catch (error) {
           toast({ title: 'Error', description: 'Could not save customers.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    saveCustomers(updatedCustomers);
    toast({
      title: 'Customer Deleted',
      description: 'The customer has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (customerData: Omit<Customer, 'id'>) => {
    if (!customerData.name.trim() || !customerData.address.trim() || !customerData.mobile.trim()) {
        toast({ title: 'Error', description: 'Customer Name, Address, and Mobile Number are required.', variant: 'destructive' });
        return false;
    }
      
    let updatedCustomers;
    if (currentCustomer) {
      updatedCustomers = customers.map(customer => (customer.id === currentCustomer.id ? { ...customer, ...customerData } : customer));
      toast({ title: 'Customer Updated', description: `"${customerData.name}" has been updated successfully.` });
    } else {
      const newCustomer: Customer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        ...customerData
      };
      updatedCustomers = [newCustomer, ...customers];
      toast({ title: 'Customer Added', description: `"${customerData.name}" has been added.` });
    }
    saveCustomers(updatedCustomers);
    return true; // Indicate success
  };

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Customers</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by name, GST, mobile..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className={cn(tdClass, "font-medium")}>{customer.name}</TableCell>
                  <TableCell className={cn(tdClass)}><Badge variant="secondary">{customer.type}</Badge></TableCell>
                  <TableCell className={cn(tdClass)}>{customer.gstin}</TableCell>
                  <TableCell className={cn(tdClass)}>{customer.address}</TableCell>
                  <TableCell className={cn(tdClass)}>{customer.mobile}</TableCell>
                  <TableCell className={cn(tdClass)}>{customer.email}</TableCell>
                  <TableCell className={cn(tdClass, "text-right")}>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                      <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(customer.id)}>
                      <Trash2 className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No customers found.
          </div>
        )}
      </CardContent>
       <AddCustomerDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          customer={currentCustomer}
        />
    </Card>
  );
}

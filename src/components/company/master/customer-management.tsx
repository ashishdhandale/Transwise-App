

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
import { Pencil, Trash2, PlusCircle, Search, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddCustomerDialog } from './add-customer-dialog';
import type { Customer } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { initialCustomers } from '@/lib/sample-data';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
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
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass}>Customer Name</TableHead>
                  <TableHead className={thClass}>Type</TableHead>
                  <TableHead className={thClass}>GSTIN</TableHead>
                  <TableHead className={thClass}>Address</TableHead>
                  <TableHead className={thClass}>Mobile</TableHead>
                  <TableHead className={thClass}>Email</TableHead>
                  <TableHead className={cn(thClass, "w-[120px] text-right")}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className={cn(tdClass, "font-medium")}>
                      <Tooltip>
                        <TooltipTrigger asChild><p className="truncate max-w-[200px]">{customer.name}</p></TooltipTrigger>
                        <TooltipContent><p>{customer.name}</p></TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={cn(tdClass)}><Badge variant="secondary">{customer.type}</Badge></TableCell>
                    <TableCell className={cn(tdClass)}>{customer.gstin}</TableCell>
                    <TableCell className={cn(tdClass)}>
                       <Tooltip>
                        <TooltipTrigger asChild><p className="truncate max-w-[250px]">{customer.address}</p></TooltipTrigger>
                        <TooltipContent><p>{customer.address}</p></TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={cn(tdClass)}>{customer.mobile}</TableCell>
                    <TableCell className={cn(tdClass)}>
                       <Tooltip>
                        <TooltipTrigger asChild><p className="truncate max-w-[200px]">{customer.email}</p></TooltipTrigger>
                        <TooltipContent><p>{customer.email}</p></TooltipContent>
                      </Tooltip>
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
                            <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
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
                                            This action cannot be undone. This will permanently delete this customer.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(customer.id)}>Continue</AlertDialogAction>
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
          </TooltipProvider>
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

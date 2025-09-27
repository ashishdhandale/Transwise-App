
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
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Search, MoreHorizontal, Pencil, Printer, Trash2 } from 'lucide-react';
import type { RateList } from '@/lib/types';
import { getRateLists, saveRateLists } from '@/lib/rate-list-data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCustomers } from '@/lib/customer-data';
import type { Customer } from '@/lib/types';
import { format, isAfter, startOfToday } from 'date-fns';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const thClass = "bg-cyan-500 text-white font-semibold";
const tdClass = "whitespace-nowrap";

export function RateListManagement() {
  const [rateLists, setRateLists] = useState<RateList[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
        setRateLists(getRateLists());
        setCustomers(getCustomers());
    } catch (error) {
      console.error("Failed to load master data", error);
    }
  }, []);
  
  const findCustomer = (customerId: number) => {
    return customers.find(c => c.id === customerId);
  }

  const handleDelete = (id: number) => {
    const updatedLists = rateLists.filter(list => list.id !== id);
    saveRateLists(updatedLists);
    setRateLists(updatedLists);
    toast({ title: "Quotation Deleted", description: "The quotation has been successfully deleted.", variant: "destructive" });
  };

  const filteredRateLists = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return rateLists;

    return rateLists.filter(list => {
      const customer = list.customerIds.length > 0 ? findCustomer(list.customerIds[0]) : null;
      return list.name.toLowerCase().includes(searchLower) ||
             (customer && customer.name.toLowerCase().includes(searchLower));
    });
  }, [rateLists, customers, searchTerm]);

  return (
    <Card>
      <CardContent className="pt-6">
         <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div>
              <Label htmlFor="search-quotation" className="text-sm font-semibold">Search By Name / Quote No,</Label>
               <div className="relative w-full max-w-xs mt-1">
                  <Input
                    id="search-quotation"
                    placeholder="Search..."
                    className="pl-4 pr-10 border-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 border-l bg-gray-100 rounded-r-md">
                     <Search className="h-5 w-5 text-gray-500" />
                  </div>
              </div>
            </div>
            <Button asChild>
                <Link href="/company/master/quotation/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Generate New Quotation
                </Link>
            </Button>
        </div>
        <div className="overflow-x-auto border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className={thClass}>Action</TableHead>
                    <TableHead className={thClass}>Quotation No</TableHead>
                    <TableHead className={thClass}>Customer Name</TableHead>
                    <TableHead className={thClass}>Quotation Date</TableHead>
                    <TableHead className={thClass}>Valid Till</TableHead>
                    <TableHead className={thClass}>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRateLists.map((list) => {
                    const customer = list.customerIds.length > 0 ? findCustomer(list.customerIds[0]) : null;
                    const isValid = list.validTill ? isAfter(new Date(list.validTill), startOfToday()) : true;
                    const status = list.isStandard ? 'Standard' : isValid ? 'Active' : 'Expired';
                    let statusClass = '';
                    if (status === 'Standard' || status === 'Active') statusClass = 'bg-green-600';
                    if (status === 'Expired') statusClass = 'bg-red-600';
                    
                    return (
                        <TableRow key={list.id}>
                             <TableCell className={cn(tdClass)}>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Update</DropdownMenuItem>
                                        <DropdownMenuItem><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone and will permanently delete this quotation.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(list.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                            </TableCell>
                            <TableCell className={cn(tdClass, "font-medium")}>{list.name}</TableCell>
                            <TableCell className={cn(tdClass)}>{customer?.name || 'Standard'}</TableCell>
                            <TableCell className={cn(tdClass)}>{list.quotationDate ? format(new Date(list.quotationDate), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                            <TableCell className={cn(tdClass, !isValid && 'text-red-600 font-semibold')}>{list.validTill ? format(new Date(list.validTill), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                            <TableCell className={cn(tdClass)}>
                                 <Badge variant={list.isStandard ? 'default' : 'secondary'} className={statusClass}>
                                    {status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    );
                })}
                </TableBody>
            </Table>
            {filteredRateLists.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No quotations found.
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

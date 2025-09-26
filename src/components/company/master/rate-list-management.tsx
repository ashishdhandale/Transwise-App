
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
import { PlusCircle, Search } from 'lucide-react';
import type { RateList } from '@/lib/types';
import { getRateLists } from '@/lib/rate-list-data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCustomers } from '@/lib/customer-data';
import type { Customer } from '@/lib/types';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const thClass = "bg-cyan-500 text-white font-semibold";
const tdClass = "whitespace-nowrap";

export function RateListManagement() {
  const [rateLists, setRateLists] = useState<RateList[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
                    <TableHead className={thClass}>GST No</TableHead>
                    <TableHead className={thClass}>Quotation Date</TableHead>
                    <TableHead className={thClass}>Valid Till</TableHead>
                    <TableHead className={thClass}>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRateLists.map((list) => {
                    const customer = list.customerIds.length > 0 ? findCustomer(list.customerIds[0]) : null;
                    return (
                        <TableRow key={list.id}>
                             <TableCell className={cn(tdClass)}>
                                <Button variant="link" className="p-0 h-auto text-blue-600">Update</Button>
                                <span className="mx-1">|</span>
                                <Button variant="link" className="p-0 h-auto text-blue-600">Print</Button>
                            </TableCell>
                            <TableCell className={cn(tdClass, "font-medium")}>{list.name.split('-')[0]}</TableCell>
                            <TableCell className={cn(tdClass)}>{customer?.name || 'Standard'}</TableCell>
                            <TableCell className={cn(tdClass)}>{customer?.gstin || 'N/A'}</TableCell>
                            <TableCell className={cn(tdClass)}>{format(new Date(), 'dd-MMM-yyyy')}</TableCell>
                            <TableCell className={cn(tdClass)}>{format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'dd-MMM-yyyy')}</TableCell>
                            <TableCell className={cn(tdClass)}>
                                 <Badge variant={list.isStandard ? 'default' : 'secondary'} className={list.isStandard ? 'bg-green-600' : ''}>
                                    {list.isStandard ? 'Standard' : 'Active'}
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

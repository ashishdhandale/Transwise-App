
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
import { PlusCircle, Search } from 'lucide-react';
import type { RateList } from '@/lib/types';
import { getRateLists } from '@/lib/rate-list-data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCustomers } from '@/lib/customer-data';
import type { Customer } from '@/lib/types';

const thClass = "bg-primary/10 text-primary font-semibold";
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
  
  const findCustomerName = (customerId: number) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
  }

  const filteredRateLists = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return rateLists.filter(list => 
        list.name.toLowerCase().includes(searchLower) ||
        list.customerIds?.some(id => findCustomerName(id).toLowerCase().includes(searchLower))
    );
  }, [rateLists, customers, searchTerm]);

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Quotations</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or customer..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/company/master/quotation/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Generate New Quotation
                    </Link>
                </Button>
            </div>
      </CardHeader>
      <CardContent>
         <div className="overflow-x-auto border rounded-md max-h-[60vh]">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className={thClass}>Quotation Name</TableHead>
                    <TableHead className={thClass}>Associated Customers</TableHead>
                    <TableHead className={thClass}>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRateLists.map((list) => (
                    <TableRow key={list.id}>
                        <TableCell className={cn(tdClass, "font-medium")}>{list.name}</TableCell>
                        <TableCell className={cn(tdClass)}>
                            {list.customerIds && list.customerIds.length > 0 
                                ? list.customerIds.map(id => findCustomerName(id)).join(', ')
                                : 'N/A'
                            }
                        </TableCell>
                         <TableCell className={cn(tdClass)}>
                            {list.isStandard ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Standard Rate</Badge>
                            ) : (
                                <Badge variant="secondary">Quotation</Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
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


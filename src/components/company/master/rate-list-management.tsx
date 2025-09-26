

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
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
import { AddRateListDialog } from './add-rate-list-dialog';
import type { RateList, City, VehicleMaster, Item, Customer } from '@/lib/types';
import { getRateLists, saveRateLists } from '@/lib/rate-list-data';
import { getCities } from '@/lib/city-data';
import { getVehicles } from '@/lib/vehicle-data';
import { getItems } from '@/lib/item-data';
import { getCustomers } from '@/lib/customer-data';
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const thClass = "bg-primary/10 text-primary font-semibold";
const tdClass = "whitespace-nowrap";

export function RateListManagement() {
  const [rateLists, setRateLists] = useState<RateList[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRateList, setCurrentRateList] = useState<RateList | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
        setRateLists(getRateLists());
        setCities(getCities());
        setVehicles(getVehicles());
        setItems(getItems());
        setCustomers(getCustomers());
    } catch (error) {
      console.error("Failed to load master data", error);
    }
  }, []);

  const filteredRateLists = useMemo(() => {
    return rateLists.filter(list => 
        list.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rateLists, searchTerm]);

  const handleAddNew = () => {
    setCurrentRateList(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (rateList: RateList) => {
    setCurrentRateList(rateList);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: number) => {
    const updatedRateLists = rateLists.filter(list => list.id !== id);
    saveRateLists(updatedRateLists);
    setRateLists(updatedRateLists);
    toast({
      title: 'Rate List Deleted',
      description: 'The rate list has been removed.',
      variant: 'destructive',
    });
  };

  const handleSave = (rateListData: Omit<RateList, 'id'>): boolean => {
    let updatedRateLists;
    if (currentRateList) {
      updatedRateLists = rateLists.map(list => (list.id === currentRateList.id ? { id: list.id, ...rateListData } : list));
      toast({ title: 'Rate List Updated', description: `"${rateListData.name}" has been updated successfully.` });
    } else {
      const newRateList: RateList = {
        id: rateLists.length > 0 ? Math.max(...rateLists.map(c => c.id)) + 1 : 1,
        ...rateListData
      };
      updatedRateLists = [newRateList, ...rateLists];
      toast({ title: 'Rate List Added', description: `"${rateListData.name}" has been added.` });
    }
    saveRateLists(updatedRateLists);
    setRateLists(updatedRateLists);
    return true;
  };
  
  const countBadge = (count: number, singular: string, plural: string) => (
      count > 0 && <Badge variant="secondary">{count} {count === 1 ? singular : plural}</Badge>
  );

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Quotations / Rate Lists</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/company/master/quotation/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> New Quotation
                        </Link>
                    </Button>
                    <Button onClick={handleAddNew} variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Rate List
                    </Button>
                </div>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass}>Name</TableHead>
                  <TableHead className={thClass}>Associations &amp; Rates</TableHead>
                  <TableHead className={cn(thClass, "w-[120px] text-right")}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRateLists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className={cn(tdClass, "font-medium")}>{list.name}</TableCell>
                    <TableCell className={cn(tdClass)}>
                       <div className="flex items-center gap-2 flex-wrap">
                          {countBadge(list.customerIds?.length, 'Customer', 'Customers')}
                          {countBadge(list.stationRates?.length, 'Station Rule', 'Station Rules')}
                          {countBadge(list.itemRates?.length, 'Item Rule', 'Item Rules')}
                       </div>
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
                            <DropdownMenuItem onClick={() => handleEdit(list)}>
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
                                            This action cannot be undone. This will permanently delete this rate list.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(list.id)}>Continue</AlertDialogAction>
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
        {filteredRateLists.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No rate lists found.
          </div>
        )}
      </CardContent>
       <AddRateListDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          rateList={currentRateList}
          cities={cities}
          items={items}
          customers={customers}
        />
    </Card>
  );
}

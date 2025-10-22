
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
import { AddItemDialog } from './add-item-dialog';
import type { Item } from '@/lib/types';
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const LOCAL_STORAGE_KEY_ITEMS = 'transwise_items';

const initialItems: Item[] = [
    { id: 1, name: 'BOX', aliasCode: 'BOX'},
    { id: 2, name: 'BAG', aliasCode: 'BAG'},
    { id: 3, name: 'BUNDLE', aliasCode: 'BDL'},
    { id: 4, name: 'CARTON', aliasCode: 'CTN'},
    { id: 5, name: 'DRUM', aliasCode: 'DRM'},
    { id: 6, name: 'ROLL', aliasCode: 'ROL'},
    { id: 7, name: 'BALE', aliasCode: 'BLE'},
    { id: 8, name: 'PALLET', aliasCode: 'PLT'},
    { id: 9, name: 'CASE', aliasCode: 'CSE'},
    { id: 10, name: 'CRATE', aliasCode: 'CRT'},
    { id: 11, name: 'PIECE', aliasCode: 'PC'},
    { id: 12, name: 'TIN', aliasCode: 'TIN'},
    { id: 13, name: 'CYLINDER', aliasCode: 'CYL'},
    { id: 14, name: 'LOOSE', aliasCode: 'LSE'},
    { id: 15, name: 'BARREL', aliasCode: 'BRL'},
];

const tdClass = "whitespace-nowrap uppercase";

export function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      } else {
        // If no data, initialize with sample data and save it
        setItems(initialItems);
        localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(initialItems));
      }
    } catch (error) {
      console.error("Failed to load item data from local storage", error);
      setItems(initialItems);
    }
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.aliasCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleAddNew = () => {
    setCurrentItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Item) => {
    setCurrentItem(item);
    setIsDialogOpen(true);
  };
  
  const saveItems = (updatedItems: Item[]) => {
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(updatedItems));
          setItems(updatedItems);
      } catch (error) {
           toast({ title: 'Error', description: 'Could not save items.', variant: 'destructive'});
      }
  }

  const handleDelete = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    saveItems(updatedItems);
    toast({
      title: 'Item Deleted',
      description: 'The item has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (itemData: Omit<Item, 'id'>) => {
    let updatedItems;
    if (currentItem) {
      updatedItems = items.map(item => (item.id === currentItem.id ? { ...item, ...itemData } : item));
      toast({ title: 'Item Updated', description: `"${itemData.name}" has been updated successfully.` });
    } else {
      const newItem: Item = {
        id: items.length > 0 ? Math.max(...items.map(c => c.id)) + 1 : 1,
        ...itemData
      };
      updatedItems = [newItem, ...items];
      toast({ title: 'Item Added', description: `"${itemData.name}" has been added.` });
    }
    saveItems(updatedItems);
    return true; // Indicate success
  };

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Manage Items</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by name, alias..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Alias Code</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className={cn(tdClass, "font-medium")}>{item.name}</TableCell>
                  <TableCell className={cn(tdClass)}>{item.aliasCode}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
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
                                              This action cannot be undone. This will permanently delete this item.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(item.id)}>Continue</AlertDialogAction>
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
        {filteredItems.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No items found.
          </div>
        )}
      </CardContent>
       <AddItemDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          item={currentItem}
        />
    </Card>
  );
}



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
import { AddAccountDialog } from './add-account-dialog';
import type { Account } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
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
import { getAccounts, saveAccounts } from '@/lib/account-data';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

export function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const handleAddNew = () => {
    setCurrentAccount(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (account: Account) => {
    setCurrentAccount(account);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedAccounts = accounts.filter(account => account.id !== id);
    saveAccounts(updatedAccounts);
    setAccounts(updatedAccounts);
    toast({
      title: 'Account Deleted',
      description: 'The account has been removed from your list.',
      variant: 'destructive',
    });
  };

  const handleSave = (accountData: Omit<Account, 'id'>) => {
    let updatedAccounts;
    if (currentAccount) {
      updatedAccounts = accounts.map(acc => (acc.id === currentAccount.id ? { ...acc, ...accountData } : acc));
      toast({ title: 'Account Updated', description: `"${accountData.name}" has been updated successfully.` });
    } else {
      const newAccount: Account = {
        id: `account-${Date.now()}`,
        ...accountData
      };
      updatedAccounts = [newAccount, ...accounts];
      toast({ title: 'Account Added', description: `"${accountData.name}" has been added.` });
    }
    saveAccounts(updatedAccounts);
    setAccounts(updatedAccounts);
    return true;
  };

  return (
    <Card>
       <CardHeader>
            <CardTitle className="font-headline">Chart of Accounts</CardTitle>
            <div className="flex flex-row items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by name, type..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Account
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass}>Account Name</TableHead>
                  <TableHead className={thClass}>Type</TableHead>
                  <TableHead className={thClass}>GSTIN</TableHead>
                  <TableHead className={thClass}>Mobile</TableHead>
                  <TableHead className={cn(thClass, "w-[120px] text-right")}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className={cn(tdClass, "font-medium")}>{account.name}</TableCell>
                    <TableCell className={cn(tdClass)}><Badge variant="secondary">{account.type}</Badge></TableCell>
                    <TableCell className={cn(tdClass)}>{account.gstin || 'N/A'}</TableCell>
                    <TableCell className={cn(tdClass)}>{account.mobile || 'N/A'}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEdit(account)} disabled={!account.id.startsWith('account-')}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive" disabled={!account.id.startsWith('account-')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this account.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(account.id)}>Continue</AlertDialogAction>
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
        {filteredAccounts.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No accounts found.
          </div>
        )}
      </CardContent>
       <AddAccountDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          account={currentAccount}
        />
    </Card>
  );
}

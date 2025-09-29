
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Account, AccountType } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountTypes } from '@/lib/types';

interface AddAccountDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (accountData: Omit<Account, 'id'>) => boolean;
    account?: Partial<Account> | null;
}

export function AddAccountDialog({ isOpen, onOpenChange, onSave, account }: AddAccountDialogProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('Expense');
    const [openingBalance, setOpeningBalance] = useState<number | ''>('');

    const { toast } = useToast();

    useEffect(() => {
        if (account) {
            setName(account.name || '');
            setType(account.type || 'Expense');
            setOpeningBalance(account.openingBalance || 0);
        } else {
            setName('');
            setType('Expense');
            setOpeningBalance(0);
        }
    }, [account, isOpen]);


    const handleSave = () => {
        if (!name.trim()) {
            toast({ title: 'Validation Error', description: 'Account Name is required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            type,
            openingBalance: Number(openingBalance) || 0,
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{account && 'id' in account ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="account-name">Account Name</Label>
                        <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="account-type">Account Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                            <SelectTrigger id="account-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {accountTypes.filter(t => !['Customer', 'Vendor'].includes(t)).map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="opening-balance">Opening Balance</Label>
                        <Input id="opening-balance" type="number" value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

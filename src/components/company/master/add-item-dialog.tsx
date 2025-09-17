
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
import type { Item } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface AddItemDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (itemData: Omit<Item, 'id'>) => boolean;
    item?: Item | null;
}

export function AddItemDialog({ isOpen, onOpenChange, onSave, item }: AddItemDialogProps) {
    const [name, setName] = useState('');
    const [hsnCode, setHsnCode] = useState('');
    const [description, setDescription] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (item) {
            setName(item.name);
            setHsnCode(item.hsnCode);
            setDescription(item.description);
        } else {
            setName('');
            setHsnCode('');
            setDescription('');
        }
    }, [item, isOpen]);


    const handleSave = () => {
        if (!name.trim()) {
            toast({ title: 'Error', description: 'Item name is required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            hsnCode,
            description,
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="item-name">Item Name</Label>
                        <Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                     <div>
                        <Label htmlFor="hsn-code">HSN Code</Label>
                        <Input id="hsn-code" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="description">Default Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
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

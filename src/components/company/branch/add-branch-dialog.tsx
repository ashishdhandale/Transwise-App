
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
import type { Branch } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface AddBranchDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (branchData: Omit<Branch, 'id' | 'companyId'>) => boolean;
    branch?: Partial<Branch> | null;
}

export function AddBranchDialog({ isOpen, onOpenChange, onSave, branch }: AddBranchDialogProps) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (branch) {
            setName(branch.name || '');
            setLocation(branch.location || '');
        } else {
            setName('');
            setLocation('');
        }
    }, [branch, isOpen]);

    const handleSave = () => {
        if (!name.trim() || !location.trim()) {
            toast({ title: 'Validation Error', description: 'Branch Name and Location are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name,
            location,
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{branch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="branch-name">Branch Name</Label>
                        <Input id="branch-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>
                    <div>
                        <Label htmlFor="location">Location / Address</Label>
                        <Textarea id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
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

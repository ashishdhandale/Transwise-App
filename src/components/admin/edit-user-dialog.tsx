
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExistingUser } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const editUserSchema = z.object({
  id: z.number(),
  companyName: z.string().min(2, 'Company name is required.'),
  maxUsers: z.coerce.number().min(1, 'Must allow at least 1 user.'),
  maxBranches: z.coerce.number().min(0, 'Cannot be negative.'),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: ExistingUser;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedUser: ExistingUser) => void;
}

export function EditUserDialog({ user, isOpen, onOpenChange, onSave }: EditUserDialogProps) {
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      id: user.id,
      companyName: user.companyName,
      maxUsers: user.maxUsers,
      maxBranches: user.maxBranches,
    },
  });
  
  useEffect(() => {
    if (isOpen) {
        form.reset({
            id: user.id,
            companyName: user.companyName,
            maxUsers: user.maxUsers,
            maxBranches: user.maxBranches,
        });
    }
  }, [user, isOpen, form]);

  const onSubmit = (data: EditUserFormValues) => {
    const updatedUser = {
      ...user,
      ...data,
    };
    onSave(updatedUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.companyName}</DialogTitle>
          <DialogDescription>
            Update the company details and resource limits.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="maxUsers"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max User IDs</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="maxBranches"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max Branches</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

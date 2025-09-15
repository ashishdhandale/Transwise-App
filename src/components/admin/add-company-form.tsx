'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  // Company Details
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  gstNo: z.string().length(15, { message: 'GST Number must be 15 characters.' }).optional().or(z.literal('')),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),

  // Company Owner Details
  ownerFirstName: z.string().min(2, { message: 'First name is required.' }),
  ownerLastName: z.string().min(2, { message: 'Last name is required.' }),
  ownerEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  ownerPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export type AddCompanyFormValues = z.infer<typeof formSchema>;

export default function AddCompanyForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<AddCompanyFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: '',
            gstNo: '',
            address: '',
            ownerFirstName: '',
            ownerLastName: '',
            ownerEmail: '',
            ownerPassword: '',
        },
    });

    async function onSubmit(values: AddCompanyFormValues) {
        setIsSubmitting(true);
        console.log('Form Submitted:', values);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // On success:
        toast({
            title: "Company Created Successfully",
            description: `${values.companyName} has been added and the owner account is ready.`,
        });
        form.reset();
        setIsSubmitting(false);
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Company Details</CardTitle>
                <CardDescription>Enter the information for the new company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Apex Logistics Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="gstNo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>GST Number (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="15-digit GSTIN" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                        <Textarea placeholder="123 Main Street, Metropolis, 500001" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Company Owner Profile</CardTitle>
                <CardDescription>
                    Create the primary user account for the company owner. This user will have the 'Company' role.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="ownerFirstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="ownerLastName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <FormField
                    control={form.control}
                    name="ownerEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Owner's Login Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="owner@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="ownerPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Initial Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                            The owner will be prompted to change this on first login.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </CardContent>
        </Card>
        
        <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Company & User
        </Button>
      </form>
    </Form>
  );
}

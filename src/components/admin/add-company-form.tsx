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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  // Company Details
  companyCode: z.string().optional(),
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  headOfficeAddress: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  officeAddress2: z.string().optional(),
  state: z.string().min(1, { message: 'State is required.'}),
  city: z.string().min(1, { message: 'City is required.'}),
  transportId: z.string().optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format.' }).optional().or(z.literal('')),
  gstNo: z.string().length(15, { message: 'GST Number must be 15 characters.' }).optional().or(z.literal('')),
  companyContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  companyEmail: z.string().email({ message: 'Please enter a valid company email address.' }),
  
  // Auth. Person Details
  authPersonName: z.string().min(2, { message: 'Authorized person name is required.' }),
  authContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  authEmail: z.string().email({ message: 'Please enter a valid email address for login.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export type AddCompanyFormValues = z.infer<typeof formSchema>;

export default function AddCompanyForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<AddCompanyFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyCode: 'CO11',
            companyName: '',
            headOfficeAddress: '',
            officeAddress2: '',
            state: '',
            city: '',
            transportId: '',
            pan: '',
            gstNo: '',
            companyContactNo: '',
            companyEmail: '',
            authPersonName: '',
            authContactNo: '',
            authEmail: '',
            password: '',
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
                <CardTitle className="font-headline">Company Business Details</CardTitle>
                <CardDescription>Enter the information for the new company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="companyCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Company Code</FormLabel>
                            <FormControl>
                                <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Example: Transwise Logistics" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="headOfficeAddress"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Head Office Add.</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Head Office Address" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="officeAddress2"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Office Add. 2</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Branch or secondary address" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>State</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a state" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="CHHATTISGARH">CHHATTISGARH</SelectItem>
                                        <SelectItem value="MAHARASHTRA">MAHARASHTRA</SelectItem>
                                        <SelectItem value="KARNATAKA">KARNATAKA</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>City</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a city" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="RAIPUR">RAIPUR</SelectItem>
                                    <SelectItem value="BILASPUR">BILASPUR</SelectItem>
                                    <SelectItem value="DURG">DURG</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="transportId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Transport ID</FormLabel>
                            <FormControl>
                                <Input placeholder="12345678911" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="pan"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>PAN</FormLabel>
                            <FormControl>
                                <Input placeholder="ABCDE1234F" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <FormField
                    control={form.control}
                    name="gstNo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>GST No</FormLabel>
                        <FormControl>
                            <Input placeholder="15-digit GSTIN" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="companyContactNo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contact No</FormLabel>
                        <FormControl>
                            <Input placeholder="9890356869, 8888822222" {...field} />
                        </FormControl>
                         <FormDescription>
                            Put "," between numbers to separate them.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="companyEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="contact@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Authorized Person Details</CardTitle>
                <CardDescription>
                    Create the primary user account for the company. This user will have the 'Company' role.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="authPersonName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Auth. Person</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="authContactNo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contact No (for Auth. Person)</FormLabel>
                        <FormControl>
                            <Input placeholder="9890356869, 8888822643" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="authEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Login Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="owner@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Initial Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                            The owner can change this on first login.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add User
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
            </Button>
        </div>
      </form>
    </Form>
  );
}

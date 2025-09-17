'use client';

import { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  companyCode: z.string().min(2, 'Code must be 2-4 chars.').max(4, 'Code must be 2-4 chars.'),
  headOfficeAddress: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  officeAddress2: z.string().optional(),
  city: z.string().min(1, { message: 'City is required.'}),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format.' }).optional().or(z.literal('')),
  gstNo: z.string().length(15, { message: 'GST Number must be 15 characters.' }).optional().or(z.literal('')),
  companyContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  companyEmail: z.string().email({ message: 'Please enter a valid company email address.' }),
});

export type CompanyProfileFormValues = z.infer<typeof profileSchema>;

const LOCAL_STORAGE_KEY = 'transwise_company_profile';

export function CompanyProfileSettings() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CompanyProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            companyName: '',
            companyCode: 'CO',
            headOfficeAddress: '',
            officeAddress2: '',
            city: '',
            pan: '',
            gstNo: '',
            companyContactNo: '',
            companyEmail: '',
        },
    });

    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedProfile) {
                const profileData = JSON.parse(savedProfile);
                const result = profileSchema.safeParse(profileData);
                if (result.success) {
                    form.reset(result.data);
                }
            }
        } catch (error) {
            console.error("Failed to load company profile", error);
        }
    }, [form]);

    async function onSubmit(values: CompanyProfileFormValues) {
        setIsSubmitting(true);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
            toast({
                title: "Profile Updated",
                description: "Your company profile has been saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not save your profile. Please try again.",
                variant: "destructive"
            });
        }
        setIsSubmitting(false);
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Company Profile</CardTitle>
            <CardDescription>Manage your company's information. This will be used in reports, receipts, and GR numbers.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Company Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="companyCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Code for GRN</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., TRNS" {...field} />
                                </FormControl>
                                 <FormDescription>A 2-4 letter code for GR numbers.</FormDescription>
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
                            <FormLabel>Head Office Address</FormLabel>
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
                            <FormLabel>Office Address 2 (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Branch or secondary address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Head Office City (for Default Station)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your head office city" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Nagpur">Nagpur</SelectItem>
                                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                                    <SelectItem value="Pune">Pune</SelectItem>
                                    <SelectItem value="Delhi">Delhi</SelectItem>
                                </SelectContent>
                            </Select>
                        <FormDescription>This city will be the default "From Station" on new bookings.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="companyContactNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact No(s)</FormLabel>
                                <FormControl>
                                    <Input placeholder="9890356869, 8888822222" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Use commas to separate multiple numbers.
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
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="contact@yourcompany.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}

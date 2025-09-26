
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
import { Loader2, Server } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCompanyProfile, saveCompanyProfile } from '@/app/company/settings/actions';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  grnPrefix: z.string().min(2, 'Prefix must be at least 2 characters.'),
  challanPrefix: z.string().min(2, 'Prefix must be at least 2 characters.'),
  headOfficeAddress: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  officeAddress2: z.string().optional(),
  city: z.string().min(1, { message: 'City is required.'}),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format.' }).optional().or(z.literal('')),
  gstNo: z.string().length(15, { message: 'GST Number must be 15 characters.' }).optional().or(z.literal('')),
  companyContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  companyEmail: z.string().email({ message: 'Please enter a valid company email address.' }),
  currency: z.string().min(3, 'Currency code is required (e.g., INR).'),
  countryCode: z.string().min(2, 'Country code is required (e.g., en-IN).'),
});

export type CompanyProfileFormValues = z.infer<typeof profileSchema>;


export function CompanyProfileSettings() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<CompanyProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            companyName: '',
            grnPrefix: '',
            challanPrefix: '',
            headOfficeAddress: '',
            officeAddress2: '',
            city: '',
            pan: '',
            gstNo: '',
            companyContactNo: '',
            companyEmail: '',
            currency: 'INR',
            countryCode: 'en-IN',
        },
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                setIsLoading(true);
                const profileData = await getCompanyProfile();
                const result = profileSchema.safeParse(profileData);
                if (result.success) {
                    form.reset(result.data);
                } else {
                    // If parsing fails (e.g. new field 'challanPrefix' is missing), set defaults
                    form.reset({
                        ...form.getValues(), // keep existing valid values
                        ...profileData, // override with loaded data
                        challanPrefix: profileData.challanPrefix || 'CHLN' // provide default for new field
                    });
                }
            } catch (error) {
                console.error("Failed to load company profile", error);
                 toast({
                    title: "Error Loading Profile",
                    description: "Could not fetch company profile from the server.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, [form, toast]);

    async function onSubmit(values: CompanyProfileFormValues) {
        setIsSubmitting(true);
        const result = await saveCompanyProfile(values);
        if (result.success) {
            toast({
                title: "Profile Updated",
                description: "Your company profile has been saved successfully.",
            });
        } else {
             toast({
                title: "Error",
                description: result.message,
                variant: "destructive"
            });
        }
        setIsSubmitting(false);
    }
    
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Company Profile</CardTitle>
            <CardDescription>Manage your company's information. This will be used in reports, receipts, and document numbers.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        name="grnPrefix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GRN Prefix</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., CONAG" {...field} />
                                </FormControl>
                                 <FormDescription>Prefix for new GR numbers.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="challanPrefix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Challan Prefix</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., CHLN" {...field} />
                                </FormControl>
                                 <FormDescription>Prefix for new challan IDs.</FormDescription>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                 <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>The default currency for all financial values.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country/Region Code</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="en-IN">en-IN (India)</SelectItem>
                                        <SelectItem value="en-US">en-US (United States)</SelectItem>
                                        <SelectItem value="en-GB">en-GB (United Kingdom)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>Determines number and date formatting.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Server className="mr-2 h-4 w-4" />}
                    Save Profile to Database
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}

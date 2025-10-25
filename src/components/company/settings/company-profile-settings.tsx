
'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import {
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

export const profileSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  lrPrefix: z.string().optional(),
  challanPrefix: z.string().min(2, 'Prefix must be at least 2 characters.'),
  headOfficeAddress: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  officeAddress2: z.string().optional(),
  city: z.string().min(1, { message: 'City is required.'}),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format.' }),
  gstNo: z.string().length(15, { message: 'GST Number must be 15 characters.' }).optional().or(z.literal('')),
  companyContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  companyEmail: z.string().email({ message: 'Please enter a valid company email address.' }),
  currency: z.string().min(3, 'Currency code is required (e.g., INR).'),
  countryCode: z.string().min(2, 'Country code is required (e.g., en-IN).'),
  grnFormat: z.enum(['plain', 'with_char']).default('with_char'),
  lrFormat: z.enum(['compact', 'padded']).default('compact'),
}).superRefine((data, ctx) => {
    if (data.grnFormat === 'with_char' && (!data.lrPrefix || data.lrPrefix.length < 2)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lrPrefix'],
            message: 'LR Prefix must be at least 2 characters when GRN format is "With Character".'
        });
    }
});

export type CompanyProfileFormValues = z.infer<typeof profileSchema>;


export function CompanyProfileSettings() {
    // We get the form context from the parent page
    const form = useFormContext<CompanyProfileFormValues>();
    const grnFormat = form.watch('grnFormat');

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Company Profile</CardTitle>
            <CardDescription>Manage your company's information. This will be used in reports, receipts, and document numbers.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* The Form and form elements are now part of the parent page's form, so we don't need a new one here. */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                     <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem className="md:col-span-3">
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
                        name="headOfficeAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Head Office Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Head Office Address" {...field} rows={2} />
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
                                    <Textarea placeholder="Branch or secondary address" {...field} rows={2} />
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
                            <FormLabel>Head Office City</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your head office city" {...field} />
                            </FormControl>
                            <FormDescription>This city defines your company's legal jurisdiction.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="grnFormat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LR Style</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select LR format" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="with_char">With Character (e.g., ABC01)</SelectItem>
                                        <SelectItem value="plain">Plain Number (e.g., 01)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="lrPrefix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LR Prefix</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., CONAG" {...field} disabled={grnFormat === 'plain'} />
                                </FormControl>
                                 <FormDescription>Required for 'With Character' style.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="lrFormat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LR Number Format</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="compact">Compact (e.g., MT252)</SelectItem>
                                        <SelectItem value="padded">Padded (e.g., MT250002)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>Choose serial number style.</FormDescription>
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
                     <div className="md:col-span-3"><Separator className="my-2"/></div>
                    <FormField
                        control={form.control}
                        name="pan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PAN*</FormLabel>
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
                     <div className="md:col-span-3"><Separator className="my-2"/></div>
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
            </div>
        </CardContent>
    </Card>
  );
}

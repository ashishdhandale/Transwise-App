
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../(dashboard)/layout';
import { BookingSettings } from '@/components/company/settings/booking-settings';
import { Settings, Server, Loader2 } from 'lucide-react';
import { AdditionalChargesSettings } from '@/components/company/settings/additional-charges-settings';
import { ItemDetailsSettings } from '@/components/company/settings/item-details-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { GeneralInstructionsSettings } from '@/components/company/settings/general-instructions-settings';
import { CompanyProfileSettings } from '@/components/company/settings/company-profile-settings';
import { PrintFormatSettings } from '@/components/company/settings/print-format-settings';
import { ChallanFormatSettings } from '@/components/company/settings/challan-format-settings';
import { BackButton } from '@/components/ui/back-button';
import { DashboardSettings } from '@/components/company/settings/dashboard-settings';
import { Form } from '@/components/ui/form';
import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';
import { getCompanyProfile, saveCompanyProfile } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// This is a simplified combined schema. In a real app, this might be more complex.
const profileSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  lrPrefix: z.string().optional(),
  challanPrefix: z.string().min(2, 'Prefix must be at least 2 characters.'),
  headOfficeAddress: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  officeAddress2: z.string().optional(),
  city: z.string().min(1, { message: 'City is required.' }),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format.' }),
  gstNo: z.string().length(15, { message: 'GST Number must be 15 characters.' }).optional().or(z.literal('')),
  companyContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  companyEmail: z.string().email({ message: 'Please enter a valid company email address.' }),
  currency: z.string().min(3, 'Currency code is required (e.g., INR).'),
  countryCode: z.string().min(2, 'Country code is required (e.g., en-IN).'),
  grnFormat: z.enum(['plain', 'with_char']).default('with_char'),
}).superRefine((data, ctx) => {
    if (data.grnFormat === 'with_char' && (!data.lrPrefix || data.lrPrefix.length < 2)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lrPrefix'],
            message: 'LR Prefix must be at least 2 characters when GRN format is "With Character".'
        });
    }
});


function CompanySettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A single form for the entire settings page
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      lrPrefix: '',
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
      grnFormat: 'with_char',
    },
  });

   useEffect(() => {
        async function loadProfile() {
            const profileData = await getCompanyProfile();
            form.reset(profileData);
        }
        loadProfile();
    }, [form]);

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

  return (
    <main className="flex-1 p-4 md:p-8">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                  <Settings className="h-8 w-8" />
                  Company Settings
              </h1>
            </div>
             <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Server className="mr-2 h-4 w-4" />}
                Save All Settings
            </Button>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="profile">Company Profile</TabsTrigger>
                  <TabsTrigger value="booking-form">Booking Form</TabsTrigger>
                  <TabsTrigger value="print-formats">Print Formats</TabsTrigger>
                  <TabsTrigger value="challan-formats">Challan Formats</TabsTrigger>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                  <CompanyProfileSettings />
              </TabsContent>
              <TabsContent value="booking-form">
                  <div className="space-y-6">
                      <GeneralInstructionsSettings />
                      <Card>
                          <CardContent className="p-4">
                              <Tabs defaultValue="item-table-columns" className="space-y-4">
                                  <TabsList>
                                      <TabsTrigger value="item-table-rows">Item Table Rows</TabsTrigger>
                                      <TabsTrigger value="item-table-columns">Item Table Columns</TabsTrigger>
                                      <TabsTrigger value="charges">Additional Charges</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="item-table-rows">
                                      <BookingSettings />
                                  </TabsContent>
                                  <TabsContent value="item-table-columns">
                                      <ItemDetailsSettings />
                                  </TabsContent>
                                  <TabsContent value="charges">
                                      <AdditionalChargesSettings />
                                  </TabsContent>
                              </Tabs>
                          </CardContent>
                      </Card>
                  </div>
              </TabsContent>
              <TabsContent value="print-formats">
                  <PrintFormatSettings />
              </TabsContent>
              <TabsContent value="challan-formats">
                  <ChallanFormatSettings profileForm={form} />
              </TabsContent>
              <TabsContent value="dashboard">
                  <DashboardSettings />
              </TabsContent>
          </Tabs>
        </form>
      </FormProvider>
    </main>
  );
}

export default function CompanySettingsRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <CompanySettingsPage />
      </DashboardLayout>
    </Suspense>
  );
}

    
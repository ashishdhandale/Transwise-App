
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { BookingSettings } from '@/components/company/settings/booking-settings';
import { Settings } from 'lucide-react';
import { AdditionalChargesSettings } from '@/components/company/settings/additional-charges-settings';
import { ItemDetailsSettings } from '@/components/company/settings/item-details-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { GeneralInstructionsSettings } from '@/components/company/settings/general-instructions-settings';
import { CompanyProfileSettings } from '@/components/company/settings/company-profile-settings';
import { PrintFormatSettings } from '@/components/company/settings/print-format-settings';

function CompanySettingsPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-6 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Company Settings
        </h1>
        <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
                <TabsTrigger value="profile">Company Profile</TabsTrigger>
                <TabsTrigger value="booking-form">Booking Form</TabsTrigger>
                <TabsTrigger value="print-formats">Print Formats</TabsTrigger>
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
        </Tabs>
      </div>
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

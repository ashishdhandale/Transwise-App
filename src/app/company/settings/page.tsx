
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { BookingSettings } from '@/components/company/settings/booking-settings';
import { Settings } from 'lucide-react';
import { AdditionalChargesSettings } from '@/components/company/settings/additional-charges-settings';
import { ItemDetailsSettings } from '@/components/company/settings/item-details-settings';

function CompanySettingsPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-6 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Company Settings
        </h1>
        <div className="space-y-6">
            <BookingSettings />
            <AdditionalChargesSettings />
            <ItemDetailsSettings />
        </div>
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

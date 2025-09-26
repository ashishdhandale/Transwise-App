
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { VendorManagement } from '@/components/company/master/vendor-management';
import { Handshake } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';


function VendorPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <Handshake className="h-8 w-8" />
                Vendor Master
            </h1>
        </header>
        <VendorManagement />
    </main>
  );
}

export default function VendorRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <VendorPage />
      </DashboardLayout>
    </Suspense>
  );
}

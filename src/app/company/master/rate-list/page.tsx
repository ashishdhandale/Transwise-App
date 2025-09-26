
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { RateListManagement } from '@/components/company/master/rate-list-management';
import { FileSignature } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';


function RateListPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <FileSignature className="h-8 w-8" />
                Quotation / Rate List Master
            </h1>
        </header>
        <RateListManagement />
    </main>
  );
}

export default function RateListRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <RateListPage />
      </DashboardLayout>
    </Suspense>
  );
}

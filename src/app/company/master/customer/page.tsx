
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { CustomerManagement } from '@/components/company/master/customer-management';
import { Users } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';


function CustomerPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <Users className="h-8 w-8" />
                Customer Master
            </h1>
        </header>
        <CustomerManagement />
    </main>
  );
}

export default function CustomerRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <CustomerPage />
      </DashboardLayout>
    </Suspense>
  );
}


'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { DriverManagement } from '@/components/company/master/driver-management';
import { User } from 'lucide-react';


function DriverPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <User className="h-8 w-8" />
                Driver Master
            </h1>
        </header>
        <DriverManagement />
    </main>
  );
}

export default function DriverRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <DriverPage />
      </DashboardLayout>
    </Suspense>
  );
}

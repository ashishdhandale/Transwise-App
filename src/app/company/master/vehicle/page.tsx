
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { VehicleManagement } from '@/components/company/master/vehicle-management';
import { Truck } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';


function VehiclePage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <Truck className="h-8 w-8" />
                Vehicle Master
            </h1>
        </header>
        <VehicleManagement />
    </main>
  );
}

export default function VehicleRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <VehiclePage />
      </DashboardLayout>
    </Suspense>
  );
}

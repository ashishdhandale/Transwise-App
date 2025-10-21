'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { CityManagement } from '@/components/company/master/city-management';
import { MapPin } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { ClientOnly } from '@/components/ui/client-only';


function CityPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <ClientOnly>
                <BackButton />
            </ClientOnly>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <MapPin className="h-8 w-8" />
                Station Master
            </h1>
        </header>
        <ClientOnly>
            <CityManagement />
        </ClientOnly>
    </main>
  );
}

export default function CityRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <CityPage />
      </DashboardLayout>
    </Suspense>
  );
}

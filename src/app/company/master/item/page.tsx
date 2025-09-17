
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { ItemManagement } from '@/components/company/master/item-management';
import { Package } from 'lucide-react';


function ItemPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <header className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <Package className="h-8 w-8" />
                Item Master
            </h1>
        </header>
        <ItemManagement />
    </main>
  );
}

export default function ItemRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <ItemPage />
      </DashboardLayout>
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { NewInwardChallanForm } from '@/components/company/challan/new-inward-challan-form';
import { ClientOnly } from '@/components/ui/client-only';
import { ArrowDownToLine } from 'lucide-react';

function NewInwardChallanPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <header className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <ArrowDownToLine className="h-7 w-7" />
                New Inward Challan
            </h1>
        </header>
        <ClientOnly>
          <NewInwardChallanForm />
        </ClientOnly>
      </main>
    </DashboardLayout>
  );
}

export default function NewInwardChallanRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <NewInwardChallanPage />
    </Suspense>
  );
}


'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { NewInwardChallanForm } from '@/components/company/challan/new-inward-challan-form';
import { ClientOnly } from '@/components/ui/client-only';

function NewInwardChallanPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
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


'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { NewChallanForm } from '@/components/company/challan/new-challan-form';

function NewChallanPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <NewChallanForm />
      </main>
    </DashboardLayout>
  );
}

export default function NewChallanRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <NewChallanPage />
    </Suspense>
  );
}

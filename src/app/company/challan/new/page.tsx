
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { PtlChallanForm } from '@/components/company/challan/ptl-challan-form';

function NewChallanPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6 bg-secondary/30">
        <PtlChallanForm />
      </main>
    </DashboardLayout>
  );
}

export default function NewChallanRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewChallanPage />
        </Suspense>
    )
}

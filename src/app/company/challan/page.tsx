
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { ChallanList } from '@/components/company/challan/challan-list';

function ChallanListPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <ChallanList />
      </main>
    </DashboardLayout>
  );
}

export default function ChallanListRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChallanListPage />
    </Suspense>
  );
}

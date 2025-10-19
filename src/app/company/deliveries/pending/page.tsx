
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { PendingDeliveries } from '@/components/company/deliveries/pending-deliveries';

function PendingDeliveriesPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <PendingDeliveries />
      </main>
    </DashboardLayout>
  );
}

export default function PendingDeliveriesRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingDeliveriesPage />
    </Suspense>
  );
}

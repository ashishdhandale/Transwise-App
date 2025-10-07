
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { DeliveriesDashboard } from '@/components/company/deliveries/deliveries-dashboard';

function DeliveriesPage() {
  return (
    <DashboardLayout>
      <DeliveriesDashboard />
    </DashboardLayout>
  );
}

export default function DeliveriesRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeliveriesPage />
    </Suspense>
  );
}

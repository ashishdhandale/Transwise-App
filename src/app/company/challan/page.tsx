'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { ChallanDashboard } from '@/components/company/challan/challan-dashboard';
import { ClientOnly } from '@/components/ui/client-only';

function ChallanPage() {
  return (
    <DashboardLayout>
      <ClientOnly>
        <ChallanDashboard />
      </ClientOnly>
    </DashboardLayout>
  );
}

export default function ChallanRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChallanPage />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { ChallanDashboard } from '@/components/company/challan/challan-dashboard';

function ChallanPage() {
  return (
    <DashboardLayout>
      <ChallanDashboard />
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

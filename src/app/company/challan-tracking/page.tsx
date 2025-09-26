
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { ChallanTracking } from '@/components/company/challan-tracking/challan-tracking';

function ChallanTrackingPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6 bg-secondary/10">
        <ChallanTracking />
      </main>
    </DashboardLayout>
  );
}

export default function ChallanTrackingRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChallanTrackingPage />
    </Suspense>
  );
}

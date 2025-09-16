
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { ChallanTracking } from '@/components/company/challan-tracking/challan-tracking';


function ChallanTrackingPage() {
  return (
    <DashboardLayout>
      <ChallanTracking />
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

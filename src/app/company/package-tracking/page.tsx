'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { PackageTracking } from '@/components/company/tracking/package-tracking';

function PackageTrackingPage() {
  return (
    <DashboardLayout>
      <PackageTracking />
    </DashboardLayout>
  );
}

export default function PackageTrackingRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PackageTrackingPage />
    </Suspense>
  );
}


'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { VehicleHireDashboard } from '@/components/company/vehicle-hire/vehicle-hire-dashboard';

function VehicleHirePage() {
  return (
    <DashboardLayout>
      <VehicleHireDashboard />
    </DashboardLayout>
  );
}

export default function VehicleHireRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VehicleHirePage />
    </Suspense>
  );
}

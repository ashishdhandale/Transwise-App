
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { StaffDashboard } from '@/components/company/utility/staff/staff-dashboard';

function StaffManagementPage() {
  return (
    <DashboardLayout>
      <StaffDashboard />
    </DashboardLayout>
  );
}

export default function StaffManagementRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StaffManagementPage />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import DashboardLayout from '../(dashboard)/layout';
import { CompanyDashboard } from '@/components/company/company-dashboard';

function CompanyPage() {
  return (
    <DashboardLayout>
      <CompanyDashboard />
    </DashboardLayout>
  );
}

export default function CompanyRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyPage />
    </Suspense>
  );
}

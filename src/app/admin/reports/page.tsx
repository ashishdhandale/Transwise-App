
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import ReportsDashboard from '@/components/admin/reports-dashboard';
import { BackButton } from '@/components/ui/back-button';

function ReportsPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <BackButton />
        <ReportsDashboard />
    </main>
  );
}

export default function ReportsRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <ReportsPage />
      </DashboardLayout>
    </Suspense>
  );
}

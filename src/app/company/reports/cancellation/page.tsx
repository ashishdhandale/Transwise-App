
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { CancellationReport } from '@/components/company/reports/cancellation-report';

function CancellationReportPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <CancellationReport />
      </main>
    </DashboardLayout>
  );
}

export default function CancellationReportRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CancellationReportPage />
    </Suspense>
  );
}

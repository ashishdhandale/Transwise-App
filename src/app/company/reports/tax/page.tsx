
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { TaxReport } from '@/components/company/reports/tax-report';

function TaxReportPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <TaxReport />
      </main>
    </DashboardLayout>
  );
}

export default function TaxReportRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaxReportPage />
    </Suspense>
  );
}

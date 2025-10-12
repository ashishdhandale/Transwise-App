
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { ReturnBookingReport } from '@/components/company/reports/return-booking-report';

function ReturnBookingReportPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <ReturnBookingReport />
      </main>
    </DashboardLayout>
  );
}

export default function ReturnBookingReportRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReturnBookingReportPage />
    </Suspense>
  );
}

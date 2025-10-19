'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { BookingTypeReport } from '@/components/company/reports/booking-type-report';

function BookingTypeReportPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6">
        <BookingTypeReport />
      </main>
    </DashboardLayout>
  );
}

export default function BookingTypeReportRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingTypeReportPage />
    </Suspense>
  );
}

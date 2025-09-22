
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function BookingTypeReportPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Booking Type Wise Report</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Report content will be implemented here.</p>
            </CardContent>
        </Card>
    </main>
  );
}

export default function BookingTypeReportRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <BookingTypeReportPage />
      </DashboardLayout>
    </Suspense>
  );
}

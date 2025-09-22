
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function DailyBookingReportPage() {
  return (
    <main className="flex-1 p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Daily Booking Report</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Report content will be implemented here.</p>
            </CardContent>
        </Card>
    </main>
  );
}

export default function DailyBookingReportRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <DailyBookingReportPage />
      </DashboardLayout>
    </Suspense>
  );
}

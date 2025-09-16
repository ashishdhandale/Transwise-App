
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { BookingsDashboard } from '@/components/company/bookings/bookings-dashboard';


function BookingsPage() {
  return (
    <DashboardLayout>
      <BookingsDashboard />
    </DashboardLayout>
  );
}

export default function BookingsRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingsPage />
    </Suspense>
  );
}

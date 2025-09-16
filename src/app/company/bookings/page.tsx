
'use client';

import { Suspense } from 'react';
import DashboardLayout from '../../(dashboard)/layout';
import { BookingForm } from '@/components/company/bookings/booking-form';


function BookingsPage() {
  return (
    <DashboardLayout>
      <BookingForm />
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

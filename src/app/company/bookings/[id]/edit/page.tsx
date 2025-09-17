
'use client';

import NewBookingPage from '@/app/company/bookings/new/page';
import { Suspense } from 'react';

export default function EditBookingRootPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewBookingPage bookingId={params.id} />
    </Suspense>
  );
}

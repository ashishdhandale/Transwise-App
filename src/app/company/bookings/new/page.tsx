
'use client';

import DashboardLayout from '@/app/(dashboard)/layout';
import { BookingForm } from '@/components/company/bookings/booking-form';

export default function NewBookingPage() {
  return (
    <DashboardLayout>
      <main className="flex-1 p-4 md:p-6 bg-cyan-50/50">
        <BookingForm />
      </main>
    </DashboardLayout>
  );
}

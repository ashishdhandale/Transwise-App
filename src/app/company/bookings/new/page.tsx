
'use client';

import { Suspense } from 'react';
import DashboardLayout from '@/app/(dashboard)/layout';
import { BookingForm } from '@/components/company/bookings/booking-form';

function NewBookingPage() {
    return (
        <DashboardLayout>
            <main className="flex-1 p-4 md:p-6">
                <BookingForm />
            </main>
        </DashboardLayout>
    );
}

export default function NewBookingRootPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewBookingPage />
        </Suspense>
    )
}

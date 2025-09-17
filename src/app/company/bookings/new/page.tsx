
'use client';

import { PreviousBookingHeader } from '@/components/company/bookings/previous-booking-header';
import { BookingDetailsSection } from '@/components/company/bookings/booking-details-section';
import { PartyDetailsSection } from '@/components/company/bookings/party-details-section';
import { ItemDetailsTable } from '@/components/company/bookings/item-details-table';
import { ChargesSection } from '@/components/company/bookings/charges-section';
import { DeliveryInstructionsSection } from '@/components/company/bookings/delivery-instructions-section';
import { SummaryAndActionsSection } from '@/components/company/bookings/summary-and-actions-section';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/app/(dashboard)/layout';
import { Suspense } from 'react';

function NewBookingForm() {
    
    // In a real app, this would come from an API call based on the previous booking ID
    const previousBooking = {
        lrNo: '002',
        type: 'TBB',
        sender: 'NOVA INDUSTERIES',
        receiver: 'MONIKA SALES',
        qty: 250,
        toCity: 'BALAGHAT'
    };
    
  return (
    <main className="flex-1 p-4 md:p-6 bg-cyan-50/50">
        <div className="space-y-4 max-w-7xl mx-auto">
            <PreviousBookingHeader {...previousBooking} />
            <Card className="border-2 border-green-200">
                <CardContent className="p-4 space-y-4">
                    <BookingDetailsSection />
                    <PartyDetailsSection />
                    <ItemDetailsTable />
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <div className="space-y-4">
                            <ChargesSection />
                            <DeliveryInstructionsSection />
                        </div>
                        <SummaryAndActionsSection />
                    </div>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}


function NewBookingPage() {
  return (
    <DashboardLayout>
      <NewBookingForm />
    </DashboardLayout>
  );
}

export default function NewBookingRootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewBookingPage />
    </Suspense>
  );
}

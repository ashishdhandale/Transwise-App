
'use client';

import { PreviousBookingHeader } from './previous-booking-header';
import { BookingDetailsSection } from './booking-details-section';
import { PartyDetailsSection } from './party-details-section';
import { ItemDetailsTable } from './item-details-table';
import { ChargesSection } from './charges-section';
import { DeliveryInstructionsSection } from './delivery-instructions-section';
import { SummaryAndActionsSection } from './summary-and-actions-section';
import { Card, CardContent } from '@/components/ui/card';

export function BookingForm() {
    
    // In a real app, this would come from an API call based on the previous booking ID
    const previousBooking = {
        lrNo: '002',
        type: 'TBB',
        consignor: 'NOVA INDUSTERIES',
        consignee: 'MONIKA SALES',
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
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
                        <SummaryAndActionsSection />
                        <div className="space-y-4">
                            <ChargesSection />
                            <DeliveryInstructionsSection />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}

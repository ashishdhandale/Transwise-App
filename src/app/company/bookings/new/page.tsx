
'use client';

import { BookingDetailsSection } from '@/components/company/bookings/booking-details-section';
import { PartyDetailsSection } from '@/components/company/bookings/party-details-section';
import { ItemDetailsTable, type ItemRow } from '@/components/company/bookings/item-details-table';
import { ChargesSection } from '@/components/company/bookings/charges-section';
import { DeliveryInstructionsSection } from '@/components/company/bookings/delivery-instructions-section';
import { SummaryAndActionsSection } from '@/components/company/bookings/summary-and-actions-section';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/app/(dashboard)/layout';
import { Suspense, useMemo, useState } from 'react';

const createEmptyRow = (id: number): ItemRow => ({
  id,
  ewbNo: '',
  itemName: 'Frm MAS',
  description: '',
  qty: '',
  actWt: '',
  chgWt: '',
  rate: '',
  freightOn: 'Act.wt',
  lumpsum: '',
  pvtMark: '',
  invoiceNo: '',
  dValue: '',
});

function NewBookingForm() {
    const [itemRows, setItemRows] = useState<ItemRow[]>(() => {
        // This function will only run on the client, avoiding SSR issues.
        return Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i));
    });

    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);
    
  return (
    <main className="flex-1 p-4 md:p-6 bg-cyan-50/50">
        <div className="space-y-4 max-w-7xl mx-auto">
            <Card className="border-2 border-green-200">
                <CardContent className="p-4 space-y-4">
                    <BookingDetailsSection />
                    <PartyDetailsSection />
                    <ItemDetailsTable rows={itemRows} onRowsChange={setItemRows} />
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
                        <SummaryAndActionsSection />
                        <div className="space-y-4">
                            <ChargesSection basicFreight={basicFreight} />
                            <DeliveryInstructionsSection />
                        </div>
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

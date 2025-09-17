
'use client';

import { BookingDetailsSection } from '@/components/company/bookings/booking-details-section';
import { PartyDetailsSection } from '@/components/company/bookings/party-details-section';
import { ItemDetailsTable, type ItemRow } from '@/components/company/bookings/item-details-table';
import { ChargesSection } from '@/components/company/bookings/charges-section';
import { DeliveryInstructionsSection } from '@/components/company/bookings/delivery-instructions-section';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/app/(dashboard)/layout';
import { Suspense, useMemo, useState, useCallback, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { MainActionsSection } from '@/components/company/bookings/main-actions-section';
import type { Booking } from '@/lib/bookings-dashboard-data';
import type { City } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY_PROFILE = 'transwise_company_profile';

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
    const [itemRows, setItemRows] = useState<ItemRow[]>(() => []);
    
    useEffect(() => {
        setItemRows(Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i)))
    }, []);

    const [bookingType, setBookingType] = useState('FOC');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [currentGrNumber, setCurrentGrNumber] = useState('');
    const { toast } = useToast();

    const generateGrNumber = useCallback((station: City | null, bookings: Booking[]) => {
        if (!station) return '';

        let companyCode = 'CO';
        try {
            const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                if (profile.companyCode) {
                    companyCode = profile.companyCode.toUpperCase();
                }
            }
        } catch (error) {
            console.error("Failed to load company profile for GRN generation", error);
        }
        
        const alias = station.aliasCode;
        const prefix = `${companyCode}${alias}`;
        
        const lastSequence = bookings
            .filter(b => b.lrNo.startsWith(prefix))
            .map(b => parseInt(b.lrNo.replace(prefix, ''), 10))
            .filter(num => !isNaN(num)) 
            .reduce((max, current) => Math.max(max, current), 0);
            
        const newSequence = lastSequence + 1;
        
        return `${prefix}${String(newSequence).padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        const newGr = generateGrNumber(fromStation, allBookings);
        setCurrentGrNumber(newGr);
    }, [fromStation, allBookings, generateGrNumber]);


    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);

    const handleSaveBooking = () => {
        // 1. Create a new booking object from the form state
        const newBooking: Booking = {
            id: allBookings.length + 1,
            lrNo: currentGrNumber,
            bookingDate: new Date().toISOString(),
            fromCity: fromStation?.name || 'Unknown',
            toCity: 'Unknown', // This would come from form state
            lrType: 'TBB', // This would come from form state
            sender: 'Unknown', // This would come from form state
            receiver: 'Unknown', // This would come from form state
            itemDescription: itemRows.map(r => r.itemName).join(', '),
            qty: itemRows.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0),
            chgWt: itemRows.reduce((sum, r) => sum + (parseFloat(r.chgWt) || 0), 0),
            totalAmount: basicFreight, // Simplified for now
            status: 'In Stock',
        };

        // 2. Add the new booking to our state
        const updatedBookings = [...allBookings, newBooking];
        setAllBookings(updatedBookings);

        toast({
            title: 'Booking Saved',
            description: `Successfully saved GR Number: ${currentGrNumber}`,
        });

        // 3. Reset the form for the next entry
        // The GR Number will automatically regenerate due to the useEffect hook
        setItemRows(Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i)));
        // Note: In a real app, you'd reset other form fields here as well.
    };
    
  return (
    <main className="flex-1 p-4 md:p-6 bg-cyan-50/50">
        <div className="space-y-4 max-w-7xl mx-auto">
            <Card className="border-2 border-green-200">
                <CardContent className="p-4 space-y-4">
                    <BookingDetailsSection 
                        bookingType={bookingType} 
                        onBookingTypeChange={setBookingType}
                        onStationChange={setFromStation}
                        grNumber={currentGrNumber}
                    />
                    <PartyDetailsSection />
                    <ItemDetailsTable rows={itemRows} onRowsChange={setItemRows} />
                    <Separator className="my-6 border-dashed" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2">
                             <MainActionsSection onSave={handleSaveBooking} />
                        </div>
                        <div className="space-y-4">
                            <ChargesSection basicFreight={basicFreight} />
                            <DeliveryInstructionsSection />
                        </div>
                    </div>
                     <div className="text-center py-4">
                        <p className="text-xl font-bold text-green-600">
                            Booking Type: {bookingType}
                        </p>
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


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
import type { City, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';
const LOCAL_STORAGE_KEY_CUSTOMERS = 'transwise_customers';
const GRN_PREFIX = 'CONAG';

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
    
    const [bookingType, setBookingType] = useState('FOC');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [sender, setSender] = useState<Customer | null>(null);
    const [receiver, setReceiver] = useState<Customer | null>(null);

    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [currentGrNumber, setCurrentGrNumber] = useState('');
    const { toast } = useToast();

     // Load bookings from localStorage on initial client render
    useEffect(() => {
        try {
            const savedBookings = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
            if (savedBookings) {
                setAllBookings(JSON.parse(savedBookings));
            }
        } catch (error) {
            console.error("Failed to load bookings from localStorage", error);
        }
    }, []);

    // Generate GR number whenever bookings change
    useEffect(() => {
        const generateGrNumber = (bookings: Booking[]) => {
            const lastSequence = bookings
                .filter(b => b.lrNo.startsWith(GRN_PREFIX))
                .map(b => parseInt(b.lrNo.replace(GRN_PREFIX, ''), 10))
                .filter(num => !isNaN(num)) 
                .reduce((max, current) => Math.max(max, current), 0);
                
            const newSequence = lastSequence + 1;
            
            return `${GRN_PREFIX}${String(newSequence).padStart(2, '0')}`;
        };

        const newGr = generateGrNumber(allBookings);
        setCurrentGrNumber(newGr);
    }, [allBookings]);

     // Initialize item rows
    useEffect(() => {
        setItemRows(Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i)))
    }, [allBookings]);


    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);

    const handleSaveBooking = () => {
        if (!fromStation || !toStation || !sender || !receiver) {
            toast({
                title: 'Missing Information',
                description: 'Please select sender, receiver, and stations.',
                variant: 'destructive'
            });
            return;
        }

        const newBooking: Booking = {
            id: Date.now(),
            lrNo: currentGrNumber,
            bookingDate: new Date().toISOString(),
            fromCity: fromStation.name,
            toCity: toStation.name,
            lrType: 'TBB', 
            sender: sender.name,
            receiver: receiver.name,
            itemDescription: itemRows.map(r => r.itemName).join(', '),
            qty: itemRows.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0),
            chgWt: itemRows.reduce((sum, r) => sum + (parseFloat(r.chgWt) || 0), 0),
            totalAmount: basicFreight, // Simplified for now
            status: 'In Stock',
        };

        const updatedBookings = [...allBookings, newBooking];
        
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
            setAllBookings(updatedBookings);

            toast({
                title: 'Booking Saved',
                description: `Successfully saved GR Number: ${currentGrNumber}`,
            });

            // Reset form fields for the next entry
            setFromStation(null);
            setToStation(null);
            setSender(null);
            setReceiver(null);
            setItemRows([]); // It will be repopulated by the useEffect
        } catch (error) {
             toast({
                title: 'Error Saving Booking',
                description: `Could not save booking to local storage.`,
                variant: 'destructive'
            });
        }
    };
    
  return (
    <main className="flex-1 p-4 md:p-6 bg-cyan-50/50">
        <div className="space-y-4 max-w-7xl mx-auto">
            <Card className="border-2 border-green-200">
                <CardContent className="p-4 space-y-4">
                    <BookingDetailsSection 
                        bookingType={bookingType} 
                        onBookingTypeChange={setBookingType}
                        onFromStationChange={setFromStation}
                        onToStationChange={setToStation}
                        fromStation={fromStation}
                        toStation={toStation}
                        grNumber={currentGrNumber}
                    />
                    <PartyDetailsSection 
                        onSenderChange={setSender}
                        onReceiverChange={setReceiver}
                        sender={sender}
                        receiver={receiver}
                    />
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

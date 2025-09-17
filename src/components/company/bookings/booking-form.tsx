
'use client';

import { BookingDetailsSection } from '@/components/company/bookings/booking-details-section';
import { PartyDetailsSection } from '@/components/company/bookings/party-details-section';
import { ItemDetailsTable, type ItemRow } from '@/components/company/bookings/item-details-table';
import { ChargesSection } from '@/components/company/bookings/charges-section';
import { DeliveryInstructionsSection } from '@/components/company/bookings/delivery-instructions-section';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { MainActionsSection } from '@/components/company/bookings/main-actions-section';
import type { Booking } from '@/lib/bookings-dashboard-data';
import type { City, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';

const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';
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

interface BookingFormProps {
    bookingId?: string;
    onSaveSuccess?: () => void;
}

export function BookingForm({ bookingId, onSaveSuccess }: BookingFormProps) {
    const isEditMode = !!bookingId;
    
    const [itemRows, setItemRows] = useState<ItemRow[]>([]);
    const [bookingType, setBookingType] = useState('FOC');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [sender, setSender] = useState<Customer | null>(null);
    const [receiver, setReceiver] = useState<Customer | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [currentGrNumber, setCurrentGrNumber] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedBookings = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
            const parsedBookings: Booking[] = savedBookings ? JSON.parse(savedBookings) : [];
            setAllBookings(parsedBookings);

            if (isEditMode) {
                const bookingToEdit = parsedBookings.find(b => b.id === bookingId);
                if (bookingToEdit) {
                    setCurrentGrNumber(bookingToEdit.lrNo);
                    setBookingDate(new Date(bookingToEdit.bookingDate));
                    setBookingType(bookingToEdit.lrType);
                    setFromStation({ id: 0, name: bookingToEdit.fromCity, aliasCode: '', pinCode: '' });
                    setToStation({ id: 0, name: bookingToEdit.toCity, aliasCode: '', pinCode: '' });
                    setSender({ id: 0, name: bookingToEdit.sender, gstin: '', address: '', mobile: '', email: '', type: 'Company' });
                    setReceiver({ id: 0, name: bookingToEdit.receiver, gstin: '', address: '', mobile: '', email: '', type: 'Company' });
                    setItemRows(bookingToEdit.itemRows || Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i)));
                    setGrandTotal(bookingToEdit.totalAmount);
                } else {
                     toast({ title: 'Error', description: 'Booking not found.', variant: 'destructive'});
                }

            } else {
                const generateGrNumber = (bookings: Booking[]) => {
                    const lastSequence = bookings
                        .filter(b => b.lrNo.startsWith(GRN_PREFIX))
                        .map(b => parseInt(b.lrNo.replace(GRN_PREFIX, ''), 10))
                        .filter(num => !isNaN(num)) 
                        .reduce((max, current) => Math.max(max, current), 0);
                        
                    const newSequence = lastSequence + 1;
                    
                    return `${GRN_PREFIX}${String(newSequence).padStart(2, '0')}`;
                };
                setCurrentGrNumber(generateGrNumber(parsedBookings));
                setItemRows(Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i)));
            }

        } catch (error) {
            console.error("Failed to process bookings from localStorage", error);
        }
    }, [isEditMode, bookingId, toast]);


    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);


    const handleSaveOrUpdate = (finalGrandTotal: number) => {
        if (!fromStation || !toStation || !sender || !receiver || !bookingDate) {
            toast({ title: 'Missing Information', description: 'Please fill all required fields.', variant: 'destructive' });
            return;
        }

        const bookingData: Omit<Booking, 'id'> = {
            lrNo: currentGrNumber,
            bookingDate: bookingDate.toISOString(),
            fromCity: fromStation.name,
            toCity: toStation.name,
            lrType: bookingType as Booking['lrType'],
            sender: sender.name,
            receiver: receiver.name,
            itemDescription: itemRows.map(r => r.itemName).join(', '),
            qty: itemRows.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0),
            chgWt: itemRows.reduce((sum, r) => sum + (parseFloat(r.chgWt) || 0), 0),
            totalAmount: finalGrandTotal,
            status: 'In Stock',
            itemRows: itemRows,
        };

        try {
            if (isEditMode) {
                const updatedBookings = allBookings.map(b => b.id === bookingId ? { ...(b as Booking), ...bookingData, id: b.id } : b);
                localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
                addHistoryLog(currentGrNumber, 'Booking Updated', 'Admin');
                toast({ title: 'Booking Updated', description: `Successfully updated GR Number: ${currentGrNumber}` });
                if (onSaveSuccess) onSaveSuccess();
            } else {
                const newBooking: Booking = { id: `booking_${Date.now()}`, ...bookingData };
                const updatedBookings = [...allBookings, newBooking];
                localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
                addHistoryLog(currentGrNumber, 'Booking Created', 'Admin');
                toast({ title: 'Booking Saved', description: `Successfully saved GR Number: ${currentGrNumber}` });
                window.location.reload(); // Reset form for next entry
            }
        } catch (error) {
             toast({ title: 'Error Saving Data', description: `Could not save to local storage.`, variant: 'destructive' });
        }
    };
    
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-primary">{isEditMode ? `Edit Booking: ${currentGrNumber}` : 'Create New Booking'}</h1>
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
                    bookingDate={bookingDate}
                    onBookingDateChange={setBookingDate}
                    isEditMode={isEditMode}
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
                         <MainActionsSection onSave={() => handleSaveOrUpdate(grandTotal)} isEditMode={isEditMode} />
                    </div>
                    <div className="space-y-4">
                        <ChargesSection basicFreight={basicFreight} onGrandTotalChange={setGrandTotal} initialGrandTotal={isEditMode ? grandTotal : undefined} />
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
  );
}

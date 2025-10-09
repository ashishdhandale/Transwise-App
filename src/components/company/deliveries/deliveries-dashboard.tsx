
'use client';

import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { DeliveriesList } from './deliveries-list';
import { UpdateDeliveryStatusDialog } from './update-delivery-status-dialog';
import { getBookings, saveBookings, type Booking, type ItemRow } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog, getHistoryLogs } from '@/lib/history-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { DeliveryMemoDialog } from './delivery-memo-dialog';

export function DeliveriesDashboard() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [lrsForDelivery, setLrsForDelivery] = useState<Booking[]>([]);
  const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState<Booking | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedBookingForMemo, setSelectedBookingForMemo] = useState<Booking | null>(null);
  const [isMemoDialogOpen, setIsMemoDialogOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
  
  const { toast } = useToast();

  const loadData = async () => {
    const bookings = getBookings();
    const profile = await getCompanyProfile();
    
    setAllBookings(bookings);
    // Directly filter for items ready for delivery
    const itemsToDeliver = bookings.filter(b => b.status === 'In Transit');
    setLrsForDelivery(itemsToDeliver);
    setCompanyProfile(profile);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateClick = (booking: Booking) => {
    setSelectedBookingForUpdate(booking);
    setIsUpdateDialogOpen(true);
  };

  const handlePrintMemoClick = (booking: Booking) => {
    setSelectedBookingForMemo(booking);
    setIsMemoDialogOpen(true);
  }

  const handleStatusUpdate = (
    booking: Booking,
    updates: {
        status: 'Delivered' | 'Partially Delivered';
        deliveryDate: Date;
        receivedBy: string;
        remarks: string;
        updatedItems: (ItemRow & { deliveredQty: number; returnQty: number })[];
    }
  ) => {
    const { status, deliveryDate, receivedBy, remarks, updatedItems } = updates;
    const bookings = getBookings();
    let historyLogs = getHistoryLogs();

    const returnItems = updatedItems.filter(item => item.returnQty > 0);
    let finalStatus = status;

    // Create a new booking for returned items if necessary
    if (returnItems.length > 0) {
      finalStatus = 'Partially Delivered';
      const returnBookingId = `${booking.lrNo}-R${(historyLogs.find(h => h.id.startsWith(booking.lrNo))?.logs.filter(l => l.action === 'Booking Created').length || 0) + 1}`;
      
      const newReturnBooking: Booking = {
        ...booking,
        lrNo: returnBookingId,
        trackingId: `TRK-${Date.now()}`,
        status: 'In Stock',
        itemRows: returnItems.map(item => ({
          ...item,
          qty: String(item.returnQty),
          actWt: String((parseFloat(item.actWt) / parseFloat(item.qty)) * item.returnQty),
          chgWt: String((parseFloat(item.chgWt) / parseFloat(item.qty)) * item.returnQty),
        })),
        totalAmount: 0, 
        bookingDate: new Date().toISOString(),
      };

      bookings.push(newReturnBooking);
      addHistoryLog(newReturnBooking.lrNo, 'Booking Created', 'System', `Return from LR ${booking.lrNo}.`);
      toast({ title: 'Return Booking Created', description: `New LR #${newReturnBooking.lrNo} created for returned items.` });
    }

    // Update the original booking
    const updatedBookings = bookings.map(b => {
      if (b.trackingId === booking.trackingId) {
        addHistoryLog(b.lrNo, finalStatus, receivedBy, `Remarks: ${remarks}`);
        const deliveredItems = updatedItems.filter(item => item.deliveredQty > 0);
        return { 
            ...b, 
            status: finalStatus,
            itemRows: deliveredItems.map(item => ({...item, qty: String(item.deliveredQty) })),
        };
      }
      return b;
    });

    saveBookings(updatedBookings);
    setAllBookings(updatedBookings);
    setLrsForDelivery(prev => prev.filter(d => d.trackingId !== booking.trackingId));
    
    toast({ title: 'Status Updated', description: `LR #${booking.lrNo} has been marked as ${finalStatus}.`});
    setIsUpdateDialogOpen(false);
  };
  
  const handleQuickDeliver = (booking: Booking) => {
    const updatedBookings = allBookings.map(b => {
        if (b.trackingId === booking.trackingId) {
            addHistoryLog(booking.lrNo, 'Delivered', 'System', 'Quick delivery update.');
            return { ...b, status: 'Delivered' as const };
        }
        return b;
    });
    saveBookings(updatedBookings);
    setAllBookings(updatedBookings);
    setLrsForDelivery(prev => prev.filter(d => d.trackingId !== booking.trackingId));
    toast({ title: 'Status Updated', description: `LR #${booking.lrNo} has been marked as Delivered.` });
  }


  return (
    <main className="flex-1 p-4 md:p-6 bg-secondary/30">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Consignment Delivery Management
        </h1>
      </header>
      <div className="space-y-4">
        <DeliveriesList 
            deliveries={lrsForDelivery} 
            onUpdateClick={handleUpdateClick} 
            onPrintMemoClick={handlePrintMemoClick}
            onQuickDeliver={handleQuickDeliver}
        />
      </div>
      {selectedBookingForUpdate && (
        <UpdateDeliveryStatusDialog
          isOpen={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          booking={selectedBookingForUpdate}
          onUpdate={handleStatusUpdate}
        />
      )}
      {selectedBookingForMemo && companyProfile && (
        <DeliveryMemoDialog
          isOpen={isMemoDialogOpen}
          onOpenChange={setIsMemoDialogOpen}
          booking={selectedBookingForMemo}
          profile={companyProfile}
        />
      )}
    </main>
  );
}

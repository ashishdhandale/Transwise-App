
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Truck } from 'lucide-react';
import { DeliverySearchFilters } from './delivery-search-filters';
import { DeliveriesList } from './deliveries-list';
import { UpdateDeliveryStatusDialog } from './update-delivery-status-dialog';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';

const deliveryStatuses: Booking['status'][] = ['In Transit', 'Delivered', 'In HOLD'];

export function DeliveriesDashboard() {
  const [allDeliveries, setAllDeliveries] = useState<Booking[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    const bookings = getBookings();
    setAllDeliveries(bookings.filter(b => deliveryStatuses.includes(b.status)));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (filters: { fromDate?: Date; toDate?: Date; status?: string; toStation?: string; }) => {
    let results = allDeliveries;

    if (filters.fromDate && filters.toDate) {
      results = results.filter(d => {
        const deliveryDate = new Date(d.bookingDate);
        return deliveryDate >= filters.fromDate! && deliveryDate <= filters.toDate!;
      });
    }
    if (filters.status && filters.status !== 'All') {
      results = results.filter(d => d.status === filters.status);
    }
    if (filters.toStation && filters.toStation !== 'All') {
        results = results.filter(d => d.toCity === filters.toStation);
    }
    
    setFilteredDeliveries(results);
  };
  
  const handleUpdateClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsUpdateDialogOpen(true);
  };

  const handleStatusUpdate = (
    booking: Booking,
    status: 'Delivered' | 'In HOLD',
    deliveryDate: Date,
    receivedBy: string,
    remarks: string
  ) => {
    const allBookings = getBookings();
    const updatedBookings = allBookings.map(b => {
      if (b.trackingId === booking.trackingId) {
        addHistoryLog(b.lrNo, status, 'System', `${status} by ${receivedBy}. Remarks: ${remarks}`);
        return { ...b, status };
      }
      return b;
    });
    saveBookings(updatedBookings);
    loadData();
    setFilteredDeliveries(prev => prev.map(d => d.trackingId === booking.trackingId ? {...d, status} : d));
    toast({ title: 'Status Updated', description: `LR #${booking.lrNo} has been marked as ${status}.`});
    setIsUpdateDialogOpen(false);
  };


  return (
    <main className="flex-1 p-4 md:p-6 bg-secondary/30">
        <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Truck className="h-8 w-8" />
                Consignment Delivery Management
            </h1>
        </header>
        <div className="space-y-4">
            <DeliverySearchFilters onSearch={handleSearch} allDeliveries={allDeliveries} />
            <DeliveriesList deliveries={filteredDeliveries.length > 0 ? filteredDeliveries : allDeliveries} onUpdateClick={handleUpdateClick} />
        </div>
        {selectedBooking && (
            <UpdateDeliveryStatusDialog
                isOpen={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
                booking={selectedBooking}
                onUpdate={handleStatusUpdate}
            />
        )}
    </main>
  );
}


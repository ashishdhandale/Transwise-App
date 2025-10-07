
'use client';

import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { DeliverySearchFilters } from './delivery-search-filters';
import { DeliveriesList } from './deliveries-list';
import { UpdateDeliveryStatusDialog } from './update-delivery-status-dialog';
import { getBookings, saveBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import type { Challan, LrDetail } from '@/lib/challan-data';
import { getChallanData, getLrDetailsData } from '@/lib/challan-data';
import { ChallanList } from './challan-list';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

export function DeliveriesDashboard() {
  const [allChallans, setAllChallans] = useState<Challan[]>([]);
  const [allLrDetails, setAllLrDetails] = useState<LrDetail[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  
  const [filteredChallans, setFilteredChallans] = useState<Challan[]>([]);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [lrsForDelivery, setLrsForDelivery] = useState<Booking[]>([]);

  const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState<Booking | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const loadData = () => {
    const challans = getChallanData().filter(c => c.status === 'Finalized');
    const lrDetails = getLrDetailsData();
    const bookings = getBookings();
    
    setAllChallans(challans);
    setAllLrDetails(lrDetails);
    setAllBookings(bookings);
    setFilteredChallans(challans); // Initially show all finalized challans
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (filters: { query: string; type: 'All' | 'Dispatch' | 'Inward' }) => {
    let results = allChallans;
    if (filters.type !== 'All') {
        results = results.filter(c => c.challanType === filters.type);
    }
    if (filters.query) {
        const lowerQuery = filters.query.toLowerCase();
        results = results.filter(c => 
            c.challanId.toLowerCase().includes(lowerQuery) ||
            c.vehicleNo.toLowerCase().includes(lowerQuery) ||
            c.fromStation.toLowerCase().includes(lowerQuery) ||
            c.toStation.toLowerCase().includes(lowerQuery)
        );
    }
    setFilteredChallans(results);
    setSelectedChallan(null);
    setLrsForDelivery([]);
  };

  const handleSelectChallan = (challan: Challan) => {
    setSelectedChallan(challan);
    const relatedLrNos = new Set(allLrDetails.filter(lr => lr.challanId === challan.challanId).map(lr => lr.lrNo));
    const bookingsForChallan = allBookings.filter(b => relatedLrNos.has(b.lrNo));
    setLrsForDelivery(bookingsForChallan);
  };
  
  const handleUpdateClick = (booking: Booking) => {
    setSelectedBookingForUpdate(booking);
    setIsUpdateDialogOpen(true);
  };

  const handleStatusUpdate = (
    booking: Booking,
    status: 'Delivered' | 'In HOLD',
    deliveryDate: Date,
    receivedBy: string,
    remarks: string
  ) => {
    const updatedBookings = allBookings.map(b => {
      if (b.trackingId === booking.trackingId) {
        addHistoryLog(b.lrNo, status, 'System', `${status} by ${receivedBy}. Remarks: ${remarks}`);
        return { ...b, status };
      }
      return b;
    });
    saveBookings(updatedBookings);
    setAllBookings(updatedBookings); // Update state for immediate reflection

    // Also update the local list being displayed
    setLrsForDelivery(prev => prev.map(d => d.trackingId === booking.trackingId ? {...d, status} : d));
    
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
        <DeliverySearchFilters onSearch={handleSearch} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChallanList challans={filteredChallans} onSelectChallan={handleSelectChallan} selectedChallanId={selectedChallan?.challanId} />
            
            {selectedChallan ? (
                <DeliveriesList deliveries={lrsForDelivery} onUpdateClick={handleUpdateClick} />
            ) : (
                <Card className="flex h-full items-center justify-center border-dashed">
                    <div className="text-center text-muted-foreground">
                        <Search className="mx-auto h-12 w-12" />
                        <p className="mt-2 font-medium">Select a challan to view its consignments.</p>
                    </div>
                </Card>
            )}
        </div>
      </div>
      {selectedBookingForUpdate && (
        <UpdateDeliveryStatusDialog
          isOpen={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          booking={selectedBookingForUpdate}
          onUpdate={handleStatusUpdate}
        />
      )}
    </main>
  );
}

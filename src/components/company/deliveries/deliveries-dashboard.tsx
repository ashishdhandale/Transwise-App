
'use client';

import { useState, useEffect } from 'react';
import { Truck, Search } from 'lucide-react';
import { DeliverySearchFilters } from './delivery-search-filters';
import { DeliveriesList } from './deliveries-list';
import { UpdateDeliveryStatusDialog } from './update-delivery-status-dialog';
import { getBookings, saveBookings, type Booking, type ItemRow } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog, getHistoryLogs, saveHistoryLogs } from '@/lib/history-data';
import type { Challan, LrDetail } from '@/lib/challan-data';
import { getChallanData, getLrDetailsData } from '@/lib/challan-data';
import { ChallanList } from './challan-list';
import { Card } from '@/components/ui/card';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { DeliveryMemoDialog } from './delivery-memo-dialog';

export function DeliveriesDashboard() {
  const [allChallans, setAllChallans] = useState<Challan[]>([]);
  const [allLrDetails, setAllLrDetails] = useState<LrDetail[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  
  const [filteredChallans, setFilteredChallans] = useState<Challan[]>([]);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [lrsForDelivery, setLrsForDelivery] = useState<Booking[]>([]);

  const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState<Booking | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  const [selectedBookingForMemo, setSelectedBookingForMemo] = useState<Booking | null>(null);
  const [isMemoDialogOpen, setIsMemoDialogOpen] = useState(false);

  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
  
  const { toast } = useToast();

  const loadData = async () => {
    const challans = getChallanData().filter(c => c.status === 'Finalized');
    const lrDetails = getLrDetailsData();
    const bookings = getBookings();
    const profile = await getCompanyProfile();
    
    setAllChallans(challans);
    setAllLrDetails(lrDetails);
    setAllBookings(bookings);
    setFilteredChallans(challans);
    setCompanyProfile(profile);
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
        totalAmount: 0, // Or recalculate if needed
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

    setLrsForDelivery(prev => prev.map(d => d.trackingId === booking.trackingId ? { ...d, status: finalStatus } : d));
    
    toast({ title: 'Status Updated', description: `LR #${booking.lrNo} has been marked as ${finalStatus}.`});
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
                <DeliveriesList deliveries={lrsForDelivery} onUpdateClick={handleUpdateClick} onPrintMemoClick={handlePrintMemoClick} />
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

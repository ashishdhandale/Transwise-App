
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Truck } from 'lucide-react';
import { DeliveriesList } from './deliveries-list';
import { UpdateDeliveryStatusDialog } from './update-delivery-status-dialog';
import { getBookings, saveBookings, type Booking, type ItemRow } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { DeliveryMemoDialog } from './delivery-memo-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getChallanData, getLrDetailsData } from '@/lib/challan-data';
import type { Challan, LrDetail } from '@/lib/challan-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PendingChallan extends Challan {
  bookings: Booking[];
}

export function DeliveriesDashboard() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allChallans, setAllChallans] = useState<Challan[]>([]);
  const [allLrDetails, setAllLrDetails] = useState<LrDetail[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

  const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState<Booking | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedBookingForMemo, setSelectedBookingForMemo] = useState<Booking | null>(null);
  const [isMemoDialogOpen, setIsMemoDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const loadData = async () => {
    const bookings = getBookings();
    const challans = getChallanData();
    const lrDetails = getLrDetailsData();
    const profile = await getCompanyProfile();
    
    setAllBookings(bookings);
    setAllChallans(challans);
    setAllLrDetails(lrDetails);
    setCompanyProfile(profile);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingChallans: PendingChallan[] = useMemo(() => {
    const finalizedDispatchChallans = allChallans.filter(
      c => c.status === 'Finalized' && c.challanType === 'Dispatch'
    );

    return finalizedDispatchChallans.map(challan => {
      const lrNosForChallan = new Set(allLrDetails.filter(lr => lr.challanId === challan.challanId).map(lr => lr.lrNo));
      const bookingsForChallan = allBookings.filter(b => lrNosForChallan.has(b.lrNo) && (b.status === 'In Transit' || b.status === 'Partially Delivered'));
      return {
        ...challan,
        bookings: bookingsForChallan
      };
    }).filter(challan => challan.bookings.length > 0);
  }, [allBookings, allChallans, allLrDetails]);

  const deliveredBookings = useMemo(() => {
    return allBookings.filter(b => b.status === 'Delivered');
  }, [allBookings]);


  const handleUpdateClick = (booking: Booking) => {
    setSelectedBookingForUpdate(booking);
    setIsUpdateDialogOpen(true);
  };

  const handlePrintMemoClick = (booking: Booking) => {
    setSelectedBookingForMemo(booking);
    setIsMemoDialogOpen(true);
  }

  const handleQuickDeliver = (booking: Booking) => {
    const bookings = getBookings();
    const updatedBookings = bookings.map(b => {
      if (b.trackingId === booking.trackingId) {
        addHistoryLog(b.lrNo, 'Delivered', 'System', `Quick delivery update.`);
        return { ...b, status: 'Delivered' as const };
      }
      return b;
    });
    saveBookings(updatedBookings);
    loadData();
    toast({ title: 'Status Updated', description: `LR #${booking.lrNo} has been marked as Delivered.`});
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
    
    const returnItems = updatedItems.filter(item => item.returnQty > 0);
    let finalStatus = status;

    if (returnItems.length > 0) {
      finalStatus = 'Partially Delivered';
      const existingReturnsCount = bookings.filter(b => b.lrNo.startsWith(`${booking.lrNo}-R`)).length;
      const returnBookingId = `${booking.lrNo}-R${existingReturnsCount + 1}`;
      
      const newReturnBooking: Booking = {
        ...booking,
        lrNo: returnBookingId,
        trackingId: `TRK-${Date.now()}`,
        status: 'In Stock',
        itemRows: returnItems.map(item => {
            const originalQty = parseFloat(item.qty) || 1;
            const originalActWt = parseFloat(item.actWt) || 0;
            const originalChgWt = parseFloat(item.chgWt) || 0;
            const returnQty = item.returnQty;

            return {
                ...item,
                qty: String(returnQty),
                actWt: String((originalActWt / originalQty) * returnQty),
                chgWt: String((originalChgWt / originalQty) * returnQty),
                lumpsum: String(((parseFloat(item.lumpsum) || 0) / originalQty) * returnQty),
            }
        }),
        totalAmount: 0, 
        bookingDate: new Date().toISOString(),
      };

      bookings.push(newReturnBooking);
      addHistoryLog(newReturnBooking.lrNo, 'Booking Created', 'System', `Return from LR ${booking.lrNo}.`);
      toast({ title: 'Return Booking Created', description: `New LR #${newReturnBooking.lrNo} created for returned items.` });
    }

    const updatedBookings = bookings.map(b => {
      if (b.trackingId === booking.trackingId) {
        addHistoryLog(b.lrNo, finalStatus, receivedBy, `Remarks: ${remarks}`);
        const deliveredItems = updatedItems
            .filter(item => item.deliveredQty > 0)
            .map(item => ({...item, qty: String(item.deliveredQty) }));
            
        return { 
            ...b, 
            status: finalStatus,
            itemRows: deliveredItems,
        };
      }
      return b;
    });

    saveBookings(updatedBookings);
    loadData();
    
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
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Pending for Delivery</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {pendingChallans.map(challan => (
                        <AccordionItem value={challan.challanId} key={challan.challanId}>
                            <AccordionTrigger className="hover:bg-muted/50 px-4">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-bold text-primary">{challan.challanId}</span>
                                    <span>{challan.vehicleNo}</span>
                                    <span>{challan.fromStation} to {challan.toStation}</span>
                                    <span className="text-muted-foreground">({challan.bookings.length} LRs)</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                               <DeliveriesList 
                                    deliveries={challan.bookings} 
                                    onUpdateClick={handleUpdateClick}
                                    onPrintMemoClick={handlePrintMemoClick}
                                    onQuickDeliver={handleQuickDeliver}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {pendingChallans.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        No challans are currently pending for delivery.
                    </div>
                )}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recently Delivered</CardTitle>
            </CardHeader>
            <CardContent>
                 <DeliveriesList 
                    deliveries={deliveredBookings} 
                    onUpdateClick={handleUpdateClick}
                    onPrintMemoClick={handlePrintMemoClick}
                    onQuickDeliver={handleQuickDeliver}
                />
            </CardContent>
        </Card>
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

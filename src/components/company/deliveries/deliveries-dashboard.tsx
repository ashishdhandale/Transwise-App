

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Truck } from 'lucide-react';
import { DeliveriesList } from './deliveries-list';
import { UpdateDeliveryStatusDialog } from './update-delivery-status-dialog';
import { getBookings, saveBookings, type Booking, type ItemRow } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog, getHistoryLogs } from '@/lib/history-data';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { DeliveryMemoDialog } from './delivery-memo-dialog';
import { getChallanData, getLrDetailsData } from '@/lib/challan-data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GroupedDeliveries {
  [challanId: string]: Booking[];
}

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
    const itemsToDeliver = bookings.filter(b => b.status === 'In Transit');
    setLrsForDelivery(itemsToDeliver);
    setCompanyProfile(profile);
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedByChallan = useMemo(() => {
    const lrDetails = getLrDetailsData();
    const challanMap = new Map<string, string[]>(); // Map challanId to list of lrNo

    lrDetails.forEach(detail => {
        if (!challanMap.has(detail.challanId)) {
            challanMap.set(detail.challanId, []);
        }
        challanMap.get(detail.challanId)!.push(detail.lrNo);
    });

    const groups: GroupedDeliveries = {};

    lrsForDelivery.forEach(booking => {
        let foundChallanId = 'Unknown Challan';
        for (const [challanId, lrNos] of challanMap.entries()) {
            if (lrNos.includes(booking.lrNo)) {
                foundChallanId = challanId;
                break;
            }
        }
        if (!groups[foundChallanId]) {
            groups[foundChallanId] = [];
        }
        groups[foundChallanId].push(booking);
    });

    return groups;
  }, [lrsForDelivery]);


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
    
    const returnItems = updatedItems.filter(item => item.returnQty > 0);
    let finalStatus = status;

    if (returnItems.length > 0) {
      finalStatus = 'Partially Delivered';
      // Find how many returns already exist for this LR
      const existingReturnsCount = bookings.filter(b => b.lrNo.startsWith(`${booking.lrNo}-R`)).length;
      const returnBookingId = `${booking.lrNo}-R${existingReturnsCount + 1}`;
      
      const newReturnBooking: Booking = {
        ...booking,
        lrNo: returnBookingId,
        trackingId: `TRK-${Date.now()}`,
        status: 'In Stock',
        itemRows: returnItems.map(item => {
            const originalQty = parseFloat(item.qty) || 1; // Avoid division by zero
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
    loadData(); // Reload all data to refresh the view
    
    toast({ title: 'Status Updated', description: `LR #${booking.lrNo} has been marked as ${finalStatus}.`});
    setIsUpdateDialogOpen(false);
  };
  
  const handleQuickDeliver = (booking: Booking) => {
    const updatedBookings = getBookings().map(b => {
        if (b.trackingId === booking.trackingId) {
            addHistoryLog(booking.lrNo, 'Delivered', 'System', 'Quick delivery update.');
            return { ...b, status: 'Delivered' as const };
        }
        return b;
    });
    saveBookings(updatedBookings);
    loadData();
    toast({ title: 'Status Updated', description: `LR #${booking.lrNo} has been marked as Delivered.` });
  };

  const handleDeliverChallan = (challanId: string) => {
      const bookingsToUpdate = groupedByChallan[challanId].map(b => b.trackingId);
      const updatedBookings = getBookings().map(b => {
          if (bookingsToUpdate.includes(b.trackingId)) {
              addHistoryLog(b.lrNo, 'Delivered', 'System', `Bulk delivery update via challan ${challanId}.`);
              return { ...b, status: 'Delivered' as const };
          }
          return b;
      });
      saveBookings(updatedBookings);
      loadData();
      toast({ title: 'Challan Delivered', description: `All items in challan ${challanId} have been marked as delivered.`});
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
        {Object.keys(groupedByChallan).length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {Object.entries(groupedByChallan).map(([challanId, bookings]) => (
              <AccordionItem value={challanId} key={challanId} asChild>
                <Card>
                   <div className="flex items-center justify-between p-4 w-full">
                      <AccordionTrigger className="flex-1 text-left p-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-lg text-primary">{challanId}</h3>
                            <p className="text-sm text-muted-foreground">{bookings.length} item(s) pending</p>
                        </div>
                      </AccordionTrigger>
                       <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 ml-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeliverChallan(challanId);
                            }}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark All as Delivered
                        </Button>
                   </div>
                  <AccordionContent>
                    <CardContent className="p-0">
                       <DeliveriesList 
                          deliveries={bookings} 
                          onUpdateClick={handleUpdateClick} 
                          onPrintMemoClick={handlePrintMemoClick}
                          onQuickDeliver={handleQuickDeliver}
                       />
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
            <Card className="flex h-64 items-center justify-center border-dashed">
                <p className="text-muted-foreground">No consignments are currently awaiting delivery.</p>
            </Card>
        )}
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

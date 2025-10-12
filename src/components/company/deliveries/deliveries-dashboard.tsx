
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
import { getChallanData, getLrDetailsData, type Challan } from '@/lib/challan-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GroupedChallans {
  pending: { challan: Challan; bookings: Booking[] }[];
  delivered: { challan: Challan; bookings: Booking[] }[];
}

const thClass = "text-primary font-bold";

const ChallanTable = ({ title, data, onDeliverChallan }: { title: string, data: { challan: Challan, bookings: Booking[] }[], onDeliverChallan?: (challanId: string) => void }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={thClass}>Challan ID</TableHead>
                                <TableHead className={thClass}>Vehicle No</TableHead>
                                <TableHead className={thClass}>From</TableHead>
                                <TableHead className={thClass}>To</TableHead>
                                <TableHead className={thClass}>Date</TableHead>
                                {onDeliverChallan && <TableHead className={`${thClass} text-right`}>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map(({ challan }) => (
                                <TableRow key={challan.challanId}>
                                    <TableCell className="font-medium">{challan.challanId}</TableCell>
                                    <TableCell>{challan.vehicleNo}</TableCell>
                                    <TableCell>{challan.fromStation}</TableCell>
                                    <TableCell>{challan.toStation}</TableCell>
                                    <TableCell>{format(new Date(challan.dispatchDate), 'dd-MMM-yyyy')}</TableCell>
                                     {onDeliverChallan && (
                                        <TableCell className="text-right">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onDeliverChallan(challan.challanId)}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={onDeliverChallan ? 6 : 5} className="h-24 text-center">No challans in this category.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


export function DeliveriesDashboard() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
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
    setCompanyProfile(profile);
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedChallans = useMemo((): GroupedChallans => {
    const challans = getChallanData().filter(c => c.challanType === 'Dispatch');
    const lrDetails = getLrDetailsData();
    const bookingsMap = new Map(allBookings.map(b => [b.lrNo, b]));
    
    const pending: GroupedChallans['pending'] = [];
    const delivered: GroupedChallans['delivered'] = [];

    challans.forEach(challan => {
        const associatedLrNos = new Set(lrDetails.filter(lr => lr.challanId === challan.challanId).map(lr => lr.lrNo));
        const associatedBookings = Array.from(associatedLrNos).map(lrNo => bookingsMap.get(lrNo)).filter((b): b is Booking => !!b);

        if (associatedBookings.length === 0) return;

        const areAllDelivered = associatedBookings.every(b => b.status === 'Delivered' || b.status === 'Partially Delivered');

        if (areAllDelivered) {
            delivered.push({ challan, bookings: associatedBookings });
        } else {
            pending.push({ challan, bookings: associatedBookings });
        }
    });

    return { pending, delivered };
  }, [allBookings]);

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

  const handleDeliverChallan = (challanId: string) => {
      const challanGroup = groupedChallans.pending.find(p => p.challan.challanId === challanId);
      if (!challanGroup) return;

      const bookingsToUpdate = new Set(challanGroup.bookings.map(b => b.trackingId));
      
      const updatedBookings = getBookings().map(b => {
          if (bookingsToUpdate.has(b.trackingId) && b.status !== 'Delivered') {
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
      <div className="space-y-6">
        <ChallanTable title="Pending for Delivery" data={groupedChallans.pending} onDeliverChallan={handleDeliverChallan} />
        <ChallanTable title="Delivered Challans" data={groupedChallans.delivered} />
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


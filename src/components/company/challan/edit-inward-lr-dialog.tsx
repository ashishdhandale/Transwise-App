
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookingForm } from '../bookings/booking-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Booking } from '@/lib/bookings-dashboard-data';

interface EditInwardLrDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  bookingData: Booking | null;
  onSaveSuccess: (booking: Booking) => void;
}

export function EditInwardLrDialog({
  isOpen,
  onOpenChange,
  bookingData,
  onSaveSuccess,
}: EditInwardLrDialogProps) {

  const handleSave = (updatedBooking: Booking) => {
    onSaveSuccess(updatedBooking);
  };
  
  const dialogTitle = bookingData ? 'Edit Inward LR' : 'Add New LR';
  const dialogDescription = bookingData 
    ? 'Modify the details for this manually entered LR.' 
    : 'Enter the details for a new LR received in this challan.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
           <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
            <div className="pr-6">
                 <BookingForm 
                    bookingData={bookingData}
                    onSaveSuccess={handleSave} 
                    onClose={() => onOpenChange(false)}
                    isOfflineMode={true} // Re-use the offline mode for this specific editing context
                 />
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}




'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from '../bookings/booking-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Booking } from '@/lib/bookings-dashboard-data';

interface EditInwardLrDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  bookingData: Booking | null;
  onSave: (booking: Booking) => void;
}

export function EditInwardLrDialog({
  isOpen,
  onOpenChange,
  bookingData,
  onSave,
}: EditInwardLrDialogProps) {
  const title = bookingData ? 'Edit Inward LR' : 'Add New LR';
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow">
            <div className="pr-6">
                 <BookingForm 
                    bookingData={bookingData}
                    onSaveSuccess={onSave} 
                    onClose={() => onOpenChange(false)}
                    isOfflineMode={true} // This indicates it's for an inward/manual booking
                 />
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


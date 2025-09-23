

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from './booking-form';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  bookingId: string; // This is now trackingId
}

export function ViewBookingDialog({
  isOpen,
  onOpenChange,
  bookingId,
}: ViewBookingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>View Booking</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow">
            <div className="pr-6">
                 <BookingForm 
                    bookingId={bookingId} 
                    onClose={() => onOpenChange(false)}
                    isViewOnly={true}
                 />
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

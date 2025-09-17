
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from './booking-form';
import { ScrollArea } from '../ui/scroll-area';

interface EditBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  bookingId: string;
}

export function EditBookingDialog({
  isOpen,
  onOpenChange,
  bookingId,
}: EditBookingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow">
            <div className="pr-6">
                 <BookingForm bookingId={bookingId} onSaveSuccess={() => onOpenChange(false)} />
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

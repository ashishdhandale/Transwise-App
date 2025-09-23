

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookingForm } from './booking-form';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PartialCancellationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  bookingId: string;
}

export function PartialCancellationDialog({
  isOpen,
  onOpenChange,
  bookingId,
}: PartialCancellationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Partial Booking Cancellation</DialogTitle>
           <DialogDescription>
            Adjust quantities or remove items below. All other booking details are locked.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
            <div className="pr-6">
                 <BookingForm 
                    bookingId={bookingId} 
                    onSaveSuccess={() => onOpenChange(false)} 
                    onClose={() => onOpenChange(false)}
                    isPartialCancel={true}
                 />
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

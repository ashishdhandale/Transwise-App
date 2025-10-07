
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface UpdateDeliveryStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  booking: Booking;
  onUpdate: (
    booking: Booking,
    status: 'Delivered' | 'In HOLD',
    deliveryDate: Date,
    receivedBy: string,
    remarks: string
  ) => void;
}

export function UpdateDeliveryStatusDialog({
  isOpen,
  onOpenChange,
  booking,
  onUpdate,
}: UpdateDeliveryStatusDialogProps) {
  const [status, setStatus] = useState<'Delivered' | 'In HOLD'>('Delivered');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [receivedBy, setReceivedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (status === 'Delivered' && (!deliveryDate || !receivedBy.trim())) {
      toast({
        title: 'Missing Information',
        description: 'Delivery Date and Received By are required for delivered consignments.',
        variant: 'destructive',
      });
      return;
    }
    onUpdate(booking, status, deliveryDate!, receivedBy, remarks);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status for LR: {booking.lrNo}</DialogTitle>
          <DialogDescription>
            Update the delivery status and provide necessary details.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div>
                <Label>New Status</Label>
                <RadioGroup value={status} onValueChange={(v) => setStatus(v as 'Delivered' | 'In HOLD')} className="flex items-center gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Delivered" id="delivered" />
                        <Label htmlFor="delivered">Delivered</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="In HOLD" id="in-hold" />
                        <Label htmlFor="in-hold">In HOLD</Label>
                    </div>
                </RadioGroup>
            </div>
            {status === 'Delivered' && (
                <>
                    <div>
                        <Label>Delivery Date</Label>
                        <DatePicker date={deliveryDate} setDate={setDeliveryDate} />
                    </div>
                    <div>
                        <Label htmlFor="received-by">Received By</Label>
                        <Input
                        id="received-by"
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        placeholder="Enter name of person who received"
                        />
                    </div>
                </>
            )}
             <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any specific remarks about this delivery..."
                />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { useState, useEffect } from 'react';
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
import type { Booking, ItemRow } from '@/lib/bookings-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UpdateDeliveryStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  booking: Booking;
  onUpdate: (
    booking: Booking,
    updates: {
        status: 'Delivered' | 'Partially Delivered';
        deliveryDate: Date;
        receivedBy: string;
        remarks: string;
        updatedItems: (ItemRow & { deliveredQty: number; returnQty: number })[];
    }
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
  const [itemUpdates, setItemUpdates] = useState<(ItemRow & { deliveredQty: number, returnQty: number })[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (booking) {
        setItemUpdates(booking.itemRows.map(item => ({
            ...item,
            deliveredQty: Number(item.qty),
            returnQty: 0,
        })));
        setStatus('Delivered');
        setReceivedBy('');
        setRemarks('');
        setDeliveryDate(new Date());
    }
  }, [booking, isOpen]);

  const handleItemQtyChange = (itemId: number, type: 'delivered' | 'return', value: string) => {
    setItemUpdates(prev => prev.map(item => {
        if (item.id === itemId) {
            const originalQty = Number(item.qty);
            const newValue = Math.max(0, Math.min(originalQty, Number(value) || 0));

            if (type === 'delivered') {
                const returnQty = originalQty - newValue;
                return { ...item, deliveredQty: newValue, returnQty };
            } else { // type === 'return'
                const deliveredQty = originalQty - newValue;
                return { ...item, deliveredQty, returnQty: newValue };
            }
        }
        return item;
    }));
  };


  const handleSave = () => {
    if (status === 'Delivered' && (!deliveryDate || !receivedBy.trim())) {
      toast({
        title: 'Missing Information',
        description: 'Delivery Date and Received By are required for delivered consignments.',
        variant: 'destructive',
      });
      return;
    }

    const hasReturns = itemUpdates.some(item => item.returnQty > 0);
    const hasDeliveries = itemUpdates.some(item => item.deliveredQty > 0);

    let finalStatus: 'Delivered' | 'Partially Delivered' = 'Delivered';
    if (hasReturns && hasDeliveries) {
        finalStatus = 'Partially Delivered';
    } else if (hasReturns && !hasDeliveries) {
        // This case is essentially a full return, but we'll treat it as partial delivery logic handles it
        finalStatus = 'Partially Delivered'; 
    }

    onUpdate(booking, {
        status: finalStatus,
        deliveryDate: deliveryDate!,
        receivedBy,
        remarks,
        updatedItems: itemUpdates,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Status for LR: {booking.lrNo}</DialogTitle>
          <DialogDescription>
            Update quantities for delivered and returned items.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="overflow-y-auto border rounded-md max-h-60">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center">Total Qty</TableHead>
                            <TableHead className="text-center">Delivered Qty</TableHead>
                            <TableHead className="text-center">Return Qty</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {itemUpdates.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.itemName || item.description}</TableCell>
                                <TableCell className="text-center">{item.qty}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.deliveredQty}
                                        onChange={(e) => handleItemQtyChange(item.id, 'delivered', e.target.value)}
                                        className="h-8 text-center"
                                        max={item.qty}
                                        min={0}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.returnQty}
                                        onChange={(e) => handleItemQtyChange(item.id, 'return', e.target.value)}
                                        className="h-8 text-center"
                                        max={item.qty}
                                        min={0}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
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

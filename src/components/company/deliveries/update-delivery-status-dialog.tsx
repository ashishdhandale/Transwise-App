
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
        deliveryMemoNo: string;
        unloadingCharges: number;
        otherCharges: number;
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
  const [deliveryMemoNo, setDeliveryMemoNo] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [receivedBy, setReceivedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const [unloadingCharges, setUnloadingCharges] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [itemUpdates, setItemUpdates] = useState<(ItemRow & { deliveredQty: number, returnQty: number })[]>([]);
  const [podFileName, setPodFileName] = useState<string | null>(null);
  const podInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (booking) {
        setItemUpdates(booking.itemRows.map(item => ({
            ...item,
            deliveredQty: Number(item.qty),
            returnQty: 0,
        })));
        setDeliveryMemoNo(`MEMO-${Date.now()}`);
        setReceivedBy('');
        setRemarks('');
        setDeliveryDate(new Date());
        setUnloadingCharges(0);
        setOtherCharges(0);
        setPodFileName(null);
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

  const handlePodFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPodFileName(file.name);
    }
  };


  const handleSave = () => {
    if (!deliveryDate || !receivedBy.trim()) {
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
        finalStatus = 'Partially Delivered'; 
    }

    onUpdate(booking, {
        status: finalStatus,
        deliveryDate: deliveryDate!,
        receivedBy,
        remarks,
        deliveryMemoNo,
        unloadingCharges,
        otherCharges,
        updatedItems: itemUpdates,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Delivery Confirmation: {booking.lrNo}</DialogTitle>
          <DialogDescription>
            Confirm delivery details, quantities, and any additional charges.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="delivery-memo-no">Delivery Memo No.</Label>
                    <Input id="delivery-memo-no" value={deliveryMemoNo} readOnly className="font-bold bg-muted" />
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
            </div>

            <div className="space-y-2">
                <Label>Item Quantities</Label>
                <div className="border rounded-md">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-center">Total Qty</TableHead>
                                <TableHead className="text-center w-32">Delivered Qty</TableHead>
                                <TableHead className="text-center w-32">Return Qty</TableHead>
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
            </div>

            <Separator />
            
            <div className="space-y-2">
                <Label>Additional Delivery Charges</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="unloading-charges">Unloading Charges</Label>
                        <Input
                            id="unloading-charges"
                            type="number"
                            value={unloadingCharges}
                            onChange={(e) => setUnloadingCharges(Number(e.target.value))}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <Label htmlFor="other-charges">Other Charges</Label>
                        <Input
                            id="other-charges"
                            type="number"
                            value={otherCharges}
                            onChange={(e) => setOtherCharges(Number(e.target.value))}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Note any damages, shortages, or other remarks..."
                />
            </div>

             <div>
                <Label htmlFor="pod-upload">Proof of Delivery (POD)</Label>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => podInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                    <Input id="pod-upload" type="file" className="hidden" ref={podInputRef} onChange={handlePodFileChange} />
                    {podFileName && <span className="text-sm text-muted-foreground">{podFileName}</span>}
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Confirm Delivery</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

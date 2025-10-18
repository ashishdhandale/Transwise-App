
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Printer, CheckCircle, Undo2, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeliveriesListProps {
    deliveries: Booking[];
    onUpdateClick: (booking: Booking) => void;
    onPrintMemoClick: (booking: Booking) => void;
    onQuickDeliver: (booking: Booking) => void;
    onRevertDelivery: (booking: Booking) => void;
}

const statusColors: { [key: string]: string } = {
  'In Transit': 'text-blue-600 border-blue-600/40',
  'Delivered': 'text-green-600 border-green-600/40',
  'Partially Delivered': 'text-green-700 border-green-700/40',
  'In HOLD': 'text-yellow-600 border-yellow-600/40',
};

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

export function DeliveriesList({ deliveries, onUpdateClick, onPrintMemoClick, onQuickDeliver, onRevertDelivery }: DeliveriesListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={thClass}>LR No.</TableHead>
            <TableHead className={thClass}>Booking Date</TableHead>
            <TableHead className={thClass}>Sender</TableHead>
            <TableHead className={thClass}>Receiver</TableHead>
            <TableHead className={thClass}>Item & Description</TableHead>
            <TableHead className={`${thClass} text-right`}>Qty</TableHead>
            <TableHead className={`${thClass} text-right`}>Act. Wt.</TableHead>
            <TableHead className={thClass}>To</TableHead>
            <TableHead className={thClass}>Status</TableHead>
            <TableHead className={`${thClass} text-right`}>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => {
              const totalActWt = delivery.itemRows.reduce((sum, item) => sum + Number(item.actWt), 0);
              return (
              <TableRow key={delivery.trackingId}>
                <TableCell className={cn(tdClass, 'font-medium')}>{delivery.lrNo}</TableCell>
                <TableCell className={cn(tdClass)}>{format(parseISO(delivery.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.sender}</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.receiver}</TableCell>
                <TableCell className={cn(tdClass, 'max-w-xs truncate')}>{delivery.itemDescription}</TableCell>
                <TableCell className={cn(tdClass, 'text-right')}>{delivery.qty}</TableCell>
                <TableCell className={cn(tdClass, 'text-right')}>{totalActWt.toFixed(2)}</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.toCity}</TableCell>
                <TableCell className={cn(tdClass)}>
                   <Badge variant="outline" className={cn('font-semibold', statusColors[delivery.status])}>
                     {delivery.status}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {delivery.status !== 'Delivered' ? (
                          <>
                            <DropdownMenuItem onClick={() => onUpdateClick(delivery)}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onUpdateClick(delivery)} 
                            >
                              <Pencil className="mr-2 h-4 w-4" />Update Status (Partial/Return)
                            </DropdownMenuItem>
                          </>
                        ) : (
                           <DropdownMenuItem onClick={() => onRevertDelivery(delivery)}>
                              <Undo2 className="mr-2 h-4 w-4" /> Mark as Undelivered
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onPrintMemoClick(delivery)}>
                          <Printer className="mr-2 h-4 w-4" /> Print Memo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            )})
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                No consignments are currently awaiting delivery for this challan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

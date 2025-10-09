
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Printer, CheckCircle } from 'lucide-react';
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
}

const statusColors: { [key: string]: string } = {
  'In Transit': 'text-blue-600 border-blue-600/40',
  'Delivered': 'text-green-600 border-green-600/40',
  'Partially Delivered': 'text-green-700 border-green-700/40',
  'In HOLD': 'text-yellow-600 border-yellow-600/40',
};

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap";

export function DeliveriesList({ deliveries, onUpdateClick, onPrintMemoClick, onQuickDeliver }: DeliveriesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Consignments Pending for Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={thClass}>LR No.</TableHead>
                <TableHead className={thClass}>Booking Date</TableHead>
                <TableHead className={thClass}>To</TableHead>
                <TableHead className={thClass}>Receiver</TableHead>
                <TableHead className={thClass}>Status</TableHead>
                <TableHead className={`${thClass} text-right`}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length > 0 ? (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.trackingId}>
                    <TableCell className={cn(tdClass, 'font-medium')}>{delivery.lrNo}</TableCell>
                    <TableCell className={cn(tdClass)}>{format(parseISO(delivery.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                    <TableCell className={cn(tdClass)}>{delivery.toCity}</TableCell>
                    <TableCell className={cn(tdClass)}>{delivery.receiver}</TableCell>
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
                             <DropdownMenuItem onClick={() => onQuickDeliver(delivery)}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onUpdateClick(delivery)} 
                              disabled={delivery.status === 'Delivered'}
                            >
                              Update Status (Partial/Return)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPrintMemoClick(delivery)}>
                              <Printer className="mr-2 h-4 w-4" /> Print Memo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No consignments are currently awaiting delivery.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

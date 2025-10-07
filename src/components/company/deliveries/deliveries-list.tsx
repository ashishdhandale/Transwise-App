
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

interface DeliveriesListProps {
    deliveries: Booking[];
    onUpdateClick: (booking: Booking) => void;
}

const statusColors: { [key: string]: string } = {
  'In Transit': 'text-blue-600 border-blue-600/40',
  'Delivered': 'text-green-600 border-green-600/40',
  'In HOLD': 'text-yellow-600 border-yellow-600/40',
};

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap";

export function DeliveriesList({ deliveries, onUpdateClick }: DeliveriesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Delivery List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={thClass}>LR No.</TableHead>
                <TableHead className={thClass}>Booking Date</TableHead>
                <TableHead className={thClass}>From</TableHead>
                <TableHead className={thClass}>To</TableHead>
                <TableHead className={thClass}>Receiver</TableHead>
                <TableHead className={thClass}>Packages</TableHead>
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
                    <TableCell className={cn(tdClass)}>{delivery.fromCity}</TableCell>
                    <TableCell className={cn(tdClass)}>{delivery.toCity}</TableCell>
                    <TableCell className={cn(tdClass)}>{delivery.receiver}</TableCell>
                    <TableCell className={cn(tdClass)}>{delivery.qty}</TableCell>
                    <TableCell className={cn(tdClass)}>
                       <Badge variant="outline" className={cn('font-semibold', statusColors[delivery.status])}>
                         {delivery.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {delivery.status !== 'Delivered' && (
                            <Button size="sm" onClick={() => onUpdateClick(delivery)}>Update Status</Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No deliveries found for the current filter.
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

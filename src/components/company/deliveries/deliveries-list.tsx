
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
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DeliveriesListProps {
    deliveries: Booking[];
}

const thClass = "bg-[#00796b] text-white font-semibold whitespace-nowrap h-10 uppercase";
const tdClass = "whitespace-nowrap uppercase text-xs";

export function DeliveriesList({ deliveries }: DeliveriesListProps) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={thClass}>#</TableHead>
            <TableHead className={thClass}>Receipt No</TableHead>
            <TableHead className={thClass}>Date</TableHead>
            <TableHead className={thClass}>LR No</TableHead>
            <TableHead className={thClass}>From CITY</TableHead>
            <TableHead className={thClass}>LR type</TableHead>
            <TableHead className={thClass}>Sender</TableHead>
            <TableHead className={thClass}>Receiver</TableHead>
            <TableHead className={thClass}>Item & Description</TableHead>
            <TableHead className={`${thClass} text-right`}>Qty</TableHead>
            <TableHead className={`${thClass} text-right`}>Chg Wt</TableHead>
            <TableHead className={thClass}>Delivery Mode</TableHead>
            <TableHead className={thClass}>payment mode</TableHead>
            <TableHead className={`${thClass} text-right`}>Total Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length > 0 ? (
            deliveries.map((delivery, index) => {
              return (
              <TableRow key={delivery.trackingId}>
                <TableCell className={cn(tdClass)}>{index + 1}</TableCell>
                <TableCell className={cn(tdClass)}>
                    {delivery.deliveryMemoNo ? (
                        <span className="font-semibold text-primary">{delivery.deliveryMemoNo}</span>
                    ) : (
                        'N/A'
                    )}
                </TableCell>
                <TableCell className={cn(tdClass)}>{format(parseISO(delivery.bookingDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell className={cn(tdClass, 'font-medium')}>{delivery.lrNo}</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.fromCity}</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.lrType}</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.sender}</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.receiver}</TableCell>
                <TableCell className={cn(tdClass, 'max-w-xs truncate')}>{delivery.itemDescription}</TableCell>
                <TableCell className={cn(tdClass, 'text-right')}>{delivery.qty}</TableCell>
                <TableCell className={cn(tdClass, 'text-right')}>{delivery.chgWt.toFixed(2)}</TableCell>
                <TableCell className={cn(tdClass)}>SELF PICK UP</TableCell>
                <TableCell className={cn(tdClass)}>{delivery.paymentMode || 'N/A'}</TableCell>
                <TableCell className={cn(tdClass, 'text-right')}>{delivery.totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            )})
          ) : (
            <TableRow>
              <TableCell colSpan={14} className="h-24 text-center">
                No deliveries found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

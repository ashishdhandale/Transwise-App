
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LrDetail } from '@/lib/challan-data';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';

const thClass = 'bg-primary/10 text-primary font-bold border-r';
const tdClass = "whitespace-nowrap border-r";

interface LrDetailsTableProps {
    lrDetails: LrDetail[];
    profile: CompanyProfileFormValues | null;
}

export function LrDetailsTable({ lrDetails, profile }: LrDetailsTableProps) {
  const formatValue = (amount: number) => {
    if (!profile) return amount.toFixed(2);
    return amount.toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  return (
    <div className="space-y-2">
        <div className="overflow-x-auto border rounded-md max-h-60">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className={thClass}>#</TableHead>
                    <TableHead className={thClass}>LR No.</TableHead>
                    <TableHead className={thClass}>LR Type</TableHead>
                    <TableHead className={thClass}>Sender</TableHead>
                    <TableHead className={thClass}>Receiver</TableHead>
                    <TableHead className={thClass}>From</TableHead>
                    <TableHead className={thClass}>To</TableHead>
                    <TableHead className={thClass}>Bkg. Date</TableHead>
                    <TableHead className={thClass}>Item-Description</TableHead>
                    <TableHead className={thClass}>Qty</TableHead>
                    <TableHead className={thClass}>Act.Wt</TableHead>
                    <TableHead className={thClass}>Chg wt.</TableHead>
                    <TableHead className={thClass}>Grand Total</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {lrDetails.map((row, index) => (
                    <TableRow key={row.lrNo}>
                        <TableCell className={cn(tdClass)}>{index + 1}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.lrNo}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.lrType}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.sender}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.receiver}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.from}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.to}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.bookingDate}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.itemDescription}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.quantity}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.actualWeight}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.chargeWeight}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatValue(row.grandTotal)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <Textarea placeholder="Dispatch Note / Receive Note" />
    </div>
  );
}

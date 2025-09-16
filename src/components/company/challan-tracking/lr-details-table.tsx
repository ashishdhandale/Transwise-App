
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

const thClass = 'bg-primary/10 text-primary font-bold border-r';

interface LrDetailsTableProps {
    lrDetails: LrDetail[];
}

export function LrDetailsTable({ lrDetails }: LrDetailsTableProps) {
  return (
    <div className="space-y-2">
        <div className="overflow-x-auto border rounded-md max-h-60">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className={thClass}>#</TableHead>
                    <TableHead className={thClass}>LR No.</TableHead>
                    <TableHead className={thClass}>LR Type</TableHead>
                    <TableHead className={thClass}>Consignor</TableHead>
                    <TableHead className={thClass}>Consignee</TableHead>
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
                        <TableCell className="border-r">{index + 1}</TableCell>
                        <TableCell className="border-r">{row.lrNo}</TableCell>
                        <TableCell className="border-r">{row.lrType}</TableCell>
                        <TableCell className="border-r">{row.consignor}</TableCell>
                        <TableCell className="border-r">{row.consignee}</TableCell>
                        <TableCell className="border-r">{row.from}</TableCell>
                        <TableCell className="border-r">{row.to}</TableCell>
                        <TableCell className="border-r">{row.bookingDate}</TableCell>
                        <TableCell className="border-r">{row.itemDescription}</TableCell>
                        <TableCell className="border-r">{row.quantity}</TableCell>
                        <TableCell className="border-r">{row.actualWeight}</TableCell>
                        <TableCell className="border-r">{row.chargeWeight}</TableCell>
                        <TableCell>{row.grandTotal.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <Textarea placeholder="Dispatch Note / Receive Note" />
    </div>
  );
}

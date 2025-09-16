
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Challan } from '@/lib/challan-data';
import { cn } from '@/lib/utils';


const thClass = 'bg-primary/10 text-primary font-bold border-r';

interface SearchResultsTableProps {
    challans: Challan[];
    onSelectChallan: (challan: Challan) => void;
    selectedChallanId?: string;
}

export function SearchResultsTable({ challans, onSelectChallan, selectedChallanId }: SearchResultsTableProps) {
  return (
    <Card className="border-primary/50">
        <CardHeader className="p-2 border-b">
            <CardTitle className="text-sm">Challan Search Result</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto max-h-48">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className={cn(thClass, 'w-[80px]')}>Select</TableHead>
                    <TableHead className={thClass}>Challan ID.</TableHead>
                    <TableHead className={thClass}>Dispatch Dt</TableHead>
                    <TableHead className={thClass}>Dispatch To Party</TableHead>
                    <TableHead className={thClass}>Veh.No.</TableHead>
                    <TableHead className={thClass}>DriverName</TableHead>
                    <TableHead className={thClass}>From Station</TableHead>
                    <TableHead className={thClass}>To Station</TableHead>
                    <TableHead className={thClass}>Sender ID</TableHead>
                    <TableHead className={thClass}>Inward ID</TableHead>
                    <TableHead className={thClass}>Inward Dt</TableHead>
                    <TableHead className={cn(thClass, 'border-r-0')}>Received From Party</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                 {challans.map((row) => (
                    <TableRow 
                      key={row.challanId} 
                      className={cn('cursor-pointer', selectedChallanId === row.challanId && 'bg-primary/20 hover:bg-primary/20')}
                      onClick={() => onSelectChallan(row)}
                    >
                        <TableCell className="border-r text-center">
                           <Button variant="link" size="sm" className="p-0 h-auto">Select</Button>
                        </TableCell>
                        <TableCell className="border-r">{row.challanId}</TableCell>
                        <TableCell className="border-r">{row.dispatchDate}</TableCell>
                        <TableCell className="border-r">{row.dispatchToParty}</TableCell>
                        <TableCell className="border-r">{row.vehicleNo}</TableCell>
                        <TableCell className="border-r">{row.driverName}</TableCell>
                        <TableCell className="border-r">{row.fromStation}</TableCell>
                        <TableCell className="border-r">{row.toStation}</TableCell>
                        <TableCell className="border-r">{row.senderId}</TableCell>
                        <TableCell className="border-r">{row.inwardId}</TableCell>
                        <TableCell className="border-r">{row.inwardDate}</TableCell>
                        <TableCell>{row.receivedFromParty}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        </CardContent>
    </Card>
  );
}


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
import type { Challan } from '@/lib/challan-data';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const thClass = 'bg-primary/10 text-primary font-semibold';
const tdClass = "whitespace-nowrap py-1.5 px-2 text-xs";

interface ChallanListProps {
    challans: Challan[];
    onSelectChallan: (challan: Challan) => void;
    selectedChallanId?: string;
}

export function ChallanList({ challans, onSelectChallan, selectedChallanId }: ChallanListProps) {
  return (
    <Card>
        <CardHeader className="p-3">
            <CardTitle className="text-base">Search Results: Challans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <ScrollArea className="h-96">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className={thClass}>Challan ID.</TableHead>
                        <TableHead className={thClass}>Date</TableHead>
                        <TableHead className={thClass}>Vehicle No.</TableHead>
                        <TableHead className={thClass}>Route</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {challans.length > 0 ? (
                        challans.map((row) => (
                            <TableRow 
                                key={row.challanId} 
                                className={cn("cursor-pointer", selectedChallanId === row.challanId && 'bg-primary/20 hover:bg-primary/20')}
                                onClick={() => onSelectChallan(row)}
                            >
                                <TableCell className={cn(tdClass, 'font-bold text-primary')}>{row.challanId}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.dispatchDate}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.vehicleNo}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.fromStation} to {row.toStation}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No challans found.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
    </Card>
  );
}

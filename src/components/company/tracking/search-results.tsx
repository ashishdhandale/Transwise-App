

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
import type { Booking } from '@/lib/bookings-dashboard-data';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const thClass = 'bg-primary/10 text-primary font-semibold';
const tdClass = "whitespace-nowrap uppercase";

interface SearchResultsProps {
  results: Booking[];
  onSelectResult: (booking: Booking) => void;
  selectedTrackingId?: string;
}

export function SearchResults({ results, onSelectResult, selectedTrackingId }: SearchResultsProps) {

  return (
    <Card className="border-primary/30">
        <CardHeader className="p-4">
            <CardTitle className="text-lg font-headline">Search Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
             {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No results found. Please try another search.</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>L.R. No.</TableHead>
                            <TableHead className={thClass}>Date</TableHead>
                            <TableHead className={thClass}>From</TableHead>
                            <TableHead className={thClass}>To</TableHead>
                            <TableHead className={thClass}>Sender</TableHead>
                            <TableHead className={thClass}>Receiver</TableHead>
                            <TableHead className={thClass}>Item &amp; Description</TableHead>
                            <TableHead className={thClass}>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {results.map((row) => (
                            <TableRow 
                                key={row.trackingId} 
                                className={cn("cursor-pointer hover:bg-primary/10", row.trackingId === selectedTrackingId && 'bg-primary/20 hover:bg-primary/20')}
                                onClick={() => onSelectResult(row)}
                            >
                                <TableCell className={cn(tdClass, 'font-bold text-primary')}>{row.lrNo}</TableCell>
                                <TableCell className={cn(tdClass)}>{format(parseISO(row.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.fromCity}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.toCity}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.sender}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.receiver}</TableCell>
                                <TableCell className={cn(tdClass)}>{row.itemDescription}</TableCell>
                                <TableCell className={cn(tdClass, 'font-semibold')}>{row.status}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
             )}
        </CardContent>
    </Card>
  );
}

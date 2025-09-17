
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

const thClass = 'bg-primary text-primary-foreground font-bold';
const tdClass = "whitespace-nowrap";

interface SearchResultsProps {
  results: Booking[];
  onSelectResult: (booking: Booking) => void;
  selectedLrNo?: string;
}

export function SearchResults({ results, onSelectResult, selectedLrNo }: SearchResultsProps) {
  if (results.length === 0) {
    return (
        <Card className="border-gray-300">
            <CardHeader className="p-3">
                <CardTitle className="text-base font-bold">Search result</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                    <p>No results found. Please try another search.</p>
                </div>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card className="border-gray-300">
        <CardHeader className="p-3">
            <CardTitle className="text-base font-bold">Search result</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className={thClass}>L.R. No.</TableHead>
                    <TableHead className={thClass}>Date</TableHead>
                    <TableHead className={thClass}>Sender</TableHead>
                    <TableHead className={thClass}>Receiver</TableHead>
                    <TableHead className={thClass}>From Station</TableHead>
                    <TableHead className={thClass}>To Station</TableHead>
                    <TableHead className={thClass}>Track Vehicle</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                 {results.map((row) => (
                    <TableRow 
                        key={row.lrNo} 
                        className={cn("cursor-pointer hover:bg-muted/50", row.lrNo === selectedLrNo && 'bg-primary/20 hover:bg-primary/20')}
                        onClick={() => onSelectResult(row)}
                    >
                        <TableCell className={cn(tdClass)}>{row.lrNo}</TableCell>
                        <TableCell className={cn(tdClass)}>{format(new Date(), 'yyyy-MM-dd')}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.sender}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.receiver}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.fromCity}</TableCell>
                        <TableCell className={cn(tdClass)}>{row.toCity}</TableCell>
                        <TableCell className={cn(tdClass)}>{/* Track Link/Button can go here */}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        </CardContent>
    </Card>
  );
}

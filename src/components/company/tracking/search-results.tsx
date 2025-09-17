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
                        <TableCell>{row.lrNo}</TableCell>
                        <TableCell>{format(new Date(), 'yyyy-MM-dd')}</TableCell>
                        <TableCell>{row.sender}</TableCell>
                        <TableCell>{row.receiver}</TableCell>
                        <TableCell>{row.fromCity}</TableCell>
                        <TableCell>{row.toCity}</TableCell>
                        <TableCell>{/* Track Link/Button can go here */}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        </CardContent>
    </Card>
  );
}

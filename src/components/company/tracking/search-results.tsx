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

const thClass = 'bg-primary text-primary-foreground font-bold';

const searchData = [
  { lrNo: '123', date: '2024-07-28', sender: 'Sender A', receiver: 'Receiver A', from: 'Station X', to: 'Station Y', track: '' },
  { lrNo: '124', date: '2024-07-29', sender: 'Sender B', receiver: 'Receiver B', from: 'Station P', to: 'Station Q', track: '' },
];


export function SearchResults() {
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
                 {searchData.map((row) => (
                    <TableRow key={row.lrNo}>
                        <TableCell>{row.lrNo}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.sender}</TableCell>
                        <TableCell>{row.receiver}</TableCell>
                        <TableCell>{row.from}</TableCell>
                        <TableCell>{row.to}</TableCell>
                        <TableCell>{row.track}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        </CardContent>
    </Card>
  );
}

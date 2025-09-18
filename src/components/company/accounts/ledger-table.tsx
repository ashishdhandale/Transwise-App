
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { LedgerEntry } from '@/lib/accounts-data';
import { cn } from '@/lib/utils';

interface LedgerTableProps {
    entries: LedgerEntry[];
    customerName: string;
}

const thClass = "bg-primary/10 text-primary font-semibold";

export function LedgerTable({ entries, customerName }: LedgerTableProps) {
    let runningBalance = 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">
                    Ledger for: <span className="text-primary">{customerName}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-md max-h-[60vh]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={thClass}>Date</TableHead>
                                <TableHead className={thClass}>Particulars</TableHead>
                                <TableHead className={`${thClass} text-right`}>Debit</TableHead>
                                <TableHead className={`${thClass} text-right`}>Credit</TableHead>
                                <TableHead className={`${thClass} text-right`}>Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((entry, index) => {
                                if (entry.particulars === 'Opening Balance') {
                                    runningBalance = entry.balance || 0;
                                } else {
                                    runningBalance += (entry.debit || 0) - (entry.credit || 0);
                                }
                                const balanceType = runningBalance >= 0 ? "Dr" : "Cr";
                                const balanceColor = runningBalance >= 0 ? "text-red-600" : "text-green-600";

                                return (
                                    <TableRow key={index}>
                                        <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                                        <TableCell className="whitespace-nowrap font-medium">{entry.particulars}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            {entry.debit ? entry.debit.toLocaleString('en-IN') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            {entry.credit ? entry.credit.toLocaleString('en-IN') : '-'}
                                        </TableCell>
                                        <TableCell className={cn("text-right whitespace-nowrap font-semibold", balanceColor)}>
                                            {Math.abs(runningBalance).toLocaleString('en-IN')} {balanceType}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {entries.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No transactions found for this customer.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

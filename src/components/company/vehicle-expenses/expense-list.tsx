
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import type { VehicleExpense } from '@/lib/vehicle-expenses-data';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface ExpenseListProps {
    expenses: VehicleExpense[];
}

const typeColors: { [key: string]: string } = {
    Fuel: 'bg-orange-100 text-orange-800',
    Maintenance: 'bg-blue-100 text-blue-800',
    Parts: 'bg-purple-100 text-purple-800',
    'Tyre Replacement': 'bg-teal-100 text-teal-800',
    Insurance: 'bg-green-100 text-green-800',
    Other: 'bg-gray-100 text-gray-800',
};

export function ExpenseList({ expenses }: ExpenseListProps) {

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [expenses]);

    return (
         <div className="overflow-x-auto border rounded-md max-h-[70vh]">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.length > 0 ? (
                        expenses.map(expense => (
                            <TableRow key={expense.id}>
                                <TableCell className="whitespace-nowrap">{format(new Date(expense.date), 'dd-MMM-yyyy')}</TableCell>
                                <TableCell>
                                    <Badge className={typeColors[expense.expenseType]}>{expense.expenseType}</Badge>
                                </TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell className="text-right font-medium">{expense.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No expenses found for the selected vehicle.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                 {expenses.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                            <TableCell className="text-right font-bold text-lg">{totalExpenses.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </div>
    );
}


'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { VehicleHireReceipt } from '@/lib/vehicle-hire-data';
import { saveVehicleHireReceipts } from '@/lib/vehicle-hire-data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface VehicleHireListProps {
    receipts: VehicleHireReceipt[];
    onEdit: (receipt: VehicleHireReceipt) => void;
    reloadReceipts: () => void;
}

const thClass = "bg-primary/10 text-primary font-semibold";

export function VehicleHireList({ receipts, onEdit, reloadReceipts }: VehicleHireListProps) {
    const { toast } = useToast();

    const handleDelete = (id: number) => {
        const updatedReceipts = receipts.filter(r => r.id !== id);
        saveVehicleHireReceipts(updatedReceipts);
        reloadReceipts();
        toast({
            title: 'Receipt Deleted',
            description: 'The vehicle hire receipt has been deleted.',
            variant: 'destructive',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vehicle Hire History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={thClass}>Receipt No.</TableHead>
                                <TableHead className={thClass}>Date</TableHead>
                                <TableHead className={thClass}>Supplier</TableHead>
                                <TableHead className={thClass}>Vehicle No.</TableHead>
                                <TableHead className={thClass}>Route</TableHead>
                                <TableHead className={`${thClass} text-right`}>Freight</TableHead>
                                <TableHead className={`${thClass} text-right`}>Advance</TableHead>
                                <TableHead className={`${thClass} text-right`}>Balance</TableHead>
                                <TableHead className={`${thClass} text-right`}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receipts.length > 0 ? receipts.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">{r.receiptNo}</TableCell>
                                    <TableCell>{format(new Date(r.date), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>{r.supplierName}</TableCell>
                                    <TableCell>{r.vehicleNo}</TableCell>
                                    <TableCell>{r.fromStation} to {r.toStation}</TableCell>
                                    <TableCell className="text-right">{r.freight.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{r.advance.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">{r.balance.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(r)}><Pencil className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">No vehicle hire receipts found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}


'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Challan } from '@/lib/challan-data';

interface SummarySectionProps {
    challan: Challan;
}

const SummaryItem = ({ label, value, isCurrency = true }: { label: string; value: string | number; isCurrency?: boolean; }) => (
    <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-semibold">
            {isCurrency ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value)) : value}
        </span>
    </div>
);


export function SummarySection({ challan }: SummarySectionProps) {
    const { grandTotal, totalTopayAmount, commission, labour, crossing, carting, balanceTruckHire, debitCreditAmount } = challan.summary;
    
  return (
    <Card className="border-primary/50 h-full">
        <CardContent className="p-4 space-y-2">
            <div className="flex justify-between font-bold text-base border-b pb-2">
                <span>Grand Total:</span>
                <span className="text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grandTotal)}</span>
            </div>
            <SummaryItem label="Total Topay Amount" value={totalTopayAmount} />
            <SummaryItem label="Commission" value={commission} />
            <SummaryItem label="Labour" value={labour} />
            <SummaryItem label="Crossing" value={crossing} />
            <SummaryItem label="Carting" value={carting} />
            <SummaryItem label="Balance Truck Hire" value={balanceTruckHire} />
            <SummaryItem label="Debit/Credit Amount" value={debitCreditAmount} />
        </CardContent>
    </Card>
  );
}

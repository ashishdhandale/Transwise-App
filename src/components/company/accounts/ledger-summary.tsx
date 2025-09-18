
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LedgerSummaryProps {
    openingBalance: number;
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
}

const SummaryRow = ({ label, value, className }: { label: string; value: number; className?: string }) => (
    <div className={cn("flex justify-between items-center p-2 rounded-md", className)}>
        <span className="font-medium">{label}</span>
        <span className="font-bold text-lg">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
        </span>
    </div>
);

export function LedgerSummary({ openingBalance, totalDebit, totalCredit, closingBalance }: LedgerSummaryProps) {
    const balanceType = closingBalance >= 0 ? "Debit" : "Credit";
    const balanceColor = closingBalance >= 0 ? "text-red-600" : "text-green-600";
    
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg font-headline text-center">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <SummaryRow label="Opening Balance" value={openingBalance} className="bg-muted" />
                <SummaryRow label="Total Debit" value={totalDebit} className="bg-red-100/50 text-red-700" />
                <SummaryRow label="Total Credit" value={totalCredit} className="bg-green-100/50 text-green-700" />
                <div className="border-t-2 border-dashed pt-3 mt-3">
                    <div className={cn("flex justify-between items-center p-3 rounded-md bg-primary/10", balanceColor)}>
                        <span className="font-bold text-base">Closing Balance</span>
                        <div className="text-right">
                            <p className="font-extrabold text-xl">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(closingBalance))}
                            </p>
                            <p className="text-sm font-semibold">{balanceType}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

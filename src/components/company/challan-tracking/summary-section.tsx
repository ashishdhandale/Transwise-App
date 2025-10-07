
'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Challan } from '@/lib/challan-data';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';

interface SummarySectionProps {
    challan: Challan;
    profile: CompanyProfileFormValues | null;
}

const SummaryItem = ({ label, value, isCurrency = true, profile }: { label: string; value: string | number; isCurrency?: boolean; profile: CompanyProfileFormValues | null }) => (
    <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-semibold">
            {isCurrency && profile ? (Number(value)).toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
        </span>
    </div>
);


export function SummarySection({ challan, profile }: SummarySectionProps) {
    const { grandTotal, totalTopayAmount, commission, labour, crossing, carting, balanceTruckHire, debitCreditAmount } = challan.summary;
    
  return (
    <Card className="border-primary/50 h-full">
        <CardContent className="p-4 space-y-2">
            <div className="flex justify-between font-bold text-base border-b pb-2">
                <span>Grand Total:</span>
                <span className="text-red-600">{profile ? grandTotal.toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : grandTotal}</span>
            </div>
            <SummaryItem label="Total Topay Amount" value={totalTopayAmount} profile={profile} />
            <SummaryItem label="Commission" value={commission} profile={profile} />
            <SummaryItem label="Labour" value={labour} profile={profile} />
            <SummaryItem label="Crossing" value={crossing} profile={profile} />
            <SummaryItem label="Carting" value={carting} profile={profile} />
            <SummaryItem label="Balance Truck Hire" value={balanceTruckHire} profile={profile} />
            <SummaryItem label="Debit/Credit Amount" value={debitCreditAmount} profile={profile} />
        </CardContent>
    </Card>
  );
}

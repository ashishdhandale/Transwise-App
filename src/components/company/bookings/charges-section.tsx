
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const ChargeInput = ({ label, defaultValue = '5.00' }: { label: string, defaultValue?: string }) => (
    <div className="grid grid-cols-[1fr_60px] items-center gap-1">
        <Label className="text-xs text-right">{label}</Label>
        <Input type="number" defaultValue={defaultValue} className="h-7 text-xs" />
    </div>
)

export function ChargesSection() {
  return (
    <Card className="p-2 border-cyan-200">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Additional Charges</h3>
        <div className="space-y-1.5">
            <ChargeInput label="Basic Freight" />
            <ChargeInput label="Builty Charge" />
            <ChargeInput label="Door Delivery" />
            <ChargeInput label="Collection Charge" />
            <ChargeInput label="Loading Labour" />
            <ChargeInput label="P.F. Charge" />
            <ChargeInput label="Others Charge" />
            <Separator />
             <div className="grid grid-cols-[1fr_60px] items-center gap-1">
                <Label className="text-xs text-right font-bold">Total</Label>
                <Input type="number" defaultValue="35" className="h-7 text-xs font-bold bg-muted" readOnly />
            </div>
            <div className="grid grid-cols-[1fr_40px_60px] items-center gap-1">
                <Label className="text-xs text-right col-start-1">GST</Label>
                <Input type="number" defaultValue="0" className="h-7 text-xs" />
                <Input type="number" defaultValue="0" className="h-7 text-xs bg-muted" readOnly />
            </div>
            <Separator />
            <div className="grid grid-cols-[1fr_80px] items-center gap-2">
                <Label className="text-sm text-right font-bold">Grand Total:</Label>
                <Input defaultValue="Rs.35" className="h-8 text-sm font-bold text-red-600 bg-red-50 border-red-200 text-center" readOnly />
            </div>
        </div>
    </Card>
  );
}


'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const ChargeInput = ({ label, defaultValue = '5.00' }: { label: string, defaultValue?: string }) => (
    <div className="grid grid-cols-2 items-center gap-4">
        <Label className="text-sm text-right">{label}</Label>
        <Input type="number" defaultValue={defaultValue} className="h-8" />
    </div>
)

export function ChargesSection() {
  return (
    <Card className="p-3 border-cyan-200">
        <h3 className="text-center font-semibold text-primary mb-2 border-b-2 border-dotted border-cyan-300 pb-1">Additional Charges</h3>
        <div className="space-y-2">
            <ChargeInput label="Basic Freight" />
            <ChargeInput label="Builty Charge" />
            <ChargeInput label="Door Delivery" />
            <ChargeInput label="Collection Charge" />
            <ChargeInput label="Loading Labour" />
            <ChargeInput label="P.F. Charge" />
            <ChargeInput label="Others Charge" />
            <Separator />
             <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-sm text-right font-bold">Total</Label>
                <Input type="number" defaultValue="35" className="h-8 font-bold bg-muted" readOnly />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-sm text-right">GST</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Input type="number" defaultValue="0" className="h-8" />
                     <Input type="number" defaultValue="0" className="h-8 bg-muted" readOnly />
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-lg text-right font-bold">Grand Total :</Label>
                <Input defaultValue="Rs.35" className="h-10 text-lg font-bold text-red-600 bg-red-50 border-red-200" readOnly />
            </div>
        </div>
    </Card>
  );
}

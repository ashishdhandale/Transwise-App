
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect, useMemo } from 'react';
import type { ChargeSetting } from '@/components/company/settings/additional-charges-settings';

const LOCAL_STORAGE_KEY = 'transwise_additional_charges_settings';

const ChargeInput = ({ label, value, readOnly = false, type = 'number' }: { label: string, value: string | number, readOnly?: boolean, type?: string }) => (
    <div className="grid grid-cols-[1fr_100px] items-center gap-2">
        <Label className="text-xs text-left whitespace-nowrap overflow-hidden text-ellipsis">{label}</Label>
        <Input type={type} value={value} readOnly={readOnly} className="h-7 text-xs w-full" />
    </div>
)

interface ChargesSectionProps {
    basicFreight: number;
}

export function ChargesSection({ basicFreight }: ChargesSectionProps) {
    const [charges, setCharges] = useState<ChargeSetting[]>([]);
    const [gstValue, setGstValue] = useState(0);
    const [gstAmount, setGstAmount] = useState(0);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.charges) {
                    setCharges(parsed.charges);
                }
            }
        } catch (error) {
            console.error("Failed to load additional charges settings", error);
        }
    }, []);
    
    const additionalChargesTotal = useMemo(() => {
        return charges
            .filter(c => c.isVisible)
            .reduce((sum, charge) => sum + (Number(charge.value) || 0), 0);
    }, [charges]);

    const total = useMemo(() => {
        return basicFreight + additionalChargesTotal;
    }, [basicFreight, additionalChargesTotal]);
    
    useEffect(() => {
        const newGstAmount = total * (gstValue / 100);
        setGstAmount(newGstAmount);
    }, [total, gstValue]);

    const grandTotal = useMemo(() => {
        return total + gstAmount;
    }, [total, gstAmount]);


  return (
    <Card className="p-2 border-cyan-200">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Additional Charges</h3>
        <div className="space-y-1.5">
             <ChargeInput label="Basic Freight" value={basicFreight.toFixed(2)} readOnly={true} />
            {charges.filter(c => c.isVisible).map((charge) => (
                <ChargeInput key={charge.id} label={charge.name} value={charge.value.toString()} readOnly />
            ))}
            <Separator />
             <div className="grid grid-cols-[1fr_100px] items-center gap-2">
                <Label className="text-xs text-left font-bold">Total</Label>
                <Input type="number" value={total.toFixed(2)} className="h-7 text-xs font-bold bg-muted w-full" readOnly />
            </div>
            <div className="grid grid-cols-[auto_1fr_100px] items-center gap-2">
                <Label className="text-xs text-left col-start-1">GST</Label>
                <Input type="number" value={gstValue} onChange={(e) => setGstValue(parseFloat(e.target.value) || 0)} className="h-7 text-xs" />
                <Input type="number" value={gstAmount.toFixed(2)} className="h-7 text-xs bg-muted" readOnly />
            </div>
            <Separator />
            <div className="grid grid-cols-[1fr_100px] items-center gap-2">
                <Label className="text-sm text-left font-bold">Grand Total:</Label>
                <Input value={`Rs.${grandTotal.toFixed(2)}`} className="h-8 text-sm font-bold text-red-600 bg-red-50 border-red-200 text-center w-full" readOnly />
            </div>
        </div>
    </Card>
  );
}

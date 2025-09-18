
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
        <Label className="text-sm text-left whitespace-nowrap overflow-hidden text-ellipsis">{label}</Label>
        <Input type={type} value={value} readOnly={readOnly} className="h-7 text-sm w-full" />
    </div>
)

interface ChargesSectionProps {
    basicFreight: number;
    onGrandTotalChange: (total: number) => void;
    initialGrandTotal?: number;
}

export function ChargesSection({ basicFreight, onGrandTotalChange, initialGrandTotal }: ChargesSectionProps) {
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

    useEffect(() => {
        onGrandTotalChange(grandTotal);
    }, [grandTotal, onGrandTotalChange]);

    useEffect(() => {
        if (initialGrandTotal !== undefined) {
            // This is complex logic. For now, let's assume GST was 0 if not saved.
            const subtotal = initialGrandTotal;
            const chargesTotal = charges.filter(c => c.isVisible).reduce((sum, charge) => sum + (Number(charge.value) || 0), 0);
            
            // This is an approximation. A more robust solution would need to store the GST percentage at the time of booking.
            if (subtotal > 0 && subtotal > basicFreight + chargesTotal) {
                 const inferredGstAmount = subtotal - (basicFreight + chargesTotal);
                 const inferredGstRate = (inferredGstAmount / (basicFreight + chargesTotal)) * 100;
                 if (inferredGstRate > 0 && inferredGstRate < 100) {
                     setGstValue(Math.round(inferredGstRate));
                 }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialGrandTotal, basicFreight, charges]);


  return (
    <Card className="p-2 border-cyan-200 h-full flex flex-col">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Additional Charges</h3>
        <div className="space-y-1.5 flex-grow">
             <ChargeInput label="Basic Freight" value={basicFreight.toFixed(2)} readOnly={true} />
            {charges.filter(c => c.isVisible).map((charge) => (
                <ChargeInput key={charge.id} label={charge.name} value={charge.value.toString()} readOnly />
            ))}
        </div>
        <Separator />
        <div className="space-y-1.5 mt-1.5">
             <div className="grid grid-cols-[1fr_100px] items-center gap-2">
                <Label className="text-sm text-left font-bold">Total</Label>
                <Input type="number" value={total.toFixed(2)} className="h-7 text-sm font-bold bg-muted w-full" readOnly />
            </div>
            <div className="grid grid-cols-[auto_1fr_100px] items-center gap-2">
                <Label className="text-sm text-left col-start-1">GST</Label>
                <Input type="number" value={gstValue} onChange={(e) => setGstValue(parseFloat(e.target.value) || 0)} className="h-7 text-sm" />
                <Input type="number" value={gstAmount.toFixed(2)} className="h-7 text-sm bg-muted" readOnly />
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

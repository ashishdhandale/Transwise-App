'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect } from 'react';
import type { ChargeSetting } from '@/components/company/settings/additional-charges-settings';

const LOCAL_STORAGE_KEY = 'transwise_additional_charges_settings';

const ChargeInput = ({ label, defaultValue = '0', type = 'number' }: { label: string, defaultValue?: string, type?: string }) => (
    <div className="grid grid-cols-2 items-center gap-2">
        <Label className="text-xs text-left whitespace-nowrap overflow-hidden text-ellipsis">{label}</Label>
        <Input type={type} defaultValue={defaultValue} className="h-7 text-xs w-full" />
    </div>
)

export function ChargesSection() {
    const [charges, setCharges] = useState<ChargeSetting[]>([]);

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


  return (
    <Card className="p-2 border-cyan-200">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Additional Charges</h3>
        <div className="space-y-1.5">
             <ChargeInput label="Basic Freight" />
            {charges.filter(c => c.isVisible).map((charge) => (
                <ChargeInput key={charge.id} label={charge.name} defaultValue={charge.value.toString()} />
            ))}
            <Separator />
             <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-xs text-left font-bold">Total</Label>
                <Input type="number" defaultValue="35" className="h-7 text-xs font-bold bg-muted w-full" readOnly />
            </div>
            <div className="grid grid-cols-[auto_40px_1fr] items-center gap-1">
                <Label className="text-xs text-left col-start-1">GST</Label>
                <Input type="number" defaultValue="0" className="h-7 text-xs" />
                <Input type="number" defaultValue="0" className="h-7 text-xs bg-muted" readOnly />
            </div>
            <Separator />
            <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-sm text-left font-bold">Grand Total:</Label>
                <Input defaultValue="Rs.35" className="h-8 text-sm font-bold text-red-600 bg-red-50 border-red-200 text-center w-full" readOnly />
            </div>
        </div>
    </Card>
  );
}

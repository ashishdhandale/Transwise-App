

'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect, useMemo } from 'react';
import type { ChargeSetting } from '@/components/company/settings/additional-charges-settings';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import type { ItemRow } from './item-details-table';

interface ChargesSectionProps {
    itemRows: ItemRow[];
    onGrandTotalChange: (total: number) => void;
    isGstApplicable: boolean;
}

export function ChargesSection({ 
    itemRows, 
    onGrandTotalChange, 
    isGstApplicable, 
}: ChargesSectionProps) {
    const [bookingCharges, setBookingCharges] = useState<{ [key:string]: number }>({});
    const [gstValue, setGstValue] = useState(0);
    const [gstAmount, setGstAmount] = useState(0);
    const [chargeSettings, setChargeSettings] = useState<ChargeSetting[]>([]);
    
    useEffect(() => {
        try {
            const settings: AllCompanySettings = JSON.parse(localStorage.getItem('transwise_company_settings') || '{}');
            const visibleCharges = (settings.additionalCharges || []).filter(c => c.isVisible);
            setChargeSettings(visibleCharges);
            const initialCharges: { [key: string]: number } = {};
            visibleCharges.forEach(charge => {
                initialCharges[charge.id] = charge.value || 0;
            });
            setBookingCharges(initialCharges);
        } catch (e) {
            console.error("Failed to load settings for charges");
        }
    }, []);

    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);

    const handleManualChargeChange = (chargeId: string, value: string) => {
        const numericValue = Number(value) || 0;
        setBookingCharges(prev => ({ ...prev, [chargeId]: numericValue }));
    };
    
    const additionalChargesTotal = useMemo(() => {
        return Object.values(bookingCharges).reduce((sum, charge) => sum + Number(charge || 0), 0);
    }, [bookingCharges]);

    const total = useMemo(() => {
        return basicFreight + additionalChargesTotal;
    }, [basicFreight, additionalChargesTotal]);
    
    useEffect(() => {
        const newGstAmount = isGstApplicable ? (total * (gstValue / 100)) : 0;
        setGstAmount(newGstAmount);
    }, [total, gstValue, isGstApplicable]);

    const grandTotal = useMemo(() => {
        return total + gstAmount;
    }, [total, gstAmount]);

    useEffect(() => {
        onGrandTotalChange(grandTotal);
    }, [grandTotal, onGrandTotalChange]);

  return (
    <Card className="p-2 border-cyan-200 h-full flex flex-col">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Additional Charges</h3>
        <div className="space-y-1.5 flex-grow">
             <div className="grid grid-cols-[1fr_100px] items-center gap-1">
                <Label className="text-sm text-left whitespace-nowrap overflow-hidden text-ellipsis">Basic Freight</Label>
                <Input type="number" value={basicFreight.toFixed(2)} readOnly className="h-7 text-sm w-full bg-muted" />
             </div>
            {chargeSettings.map((charge) => (
                 <div key={charge.id} className="grid grid-cols-[1fr_100px] items-center gap-1">
                    <Label className="text-sm text-left whitespace-nowrap overflow-hidden text-ellipsis">{charge.name}</Label>
                    <Input 
                        type="number" 
                        value={bookingCharges[charge.id] ?? ''}
                        onChange={(e) => handleManualChargeChange(charge.id, e.target.value)}
                        className="h-7 text-sm bg-card justify-self-end" 
                    />
                </div>
            ))}
        </div>
        <Separator />
        <div className="space-y-1.5 mt-1.5">
             <div className="grid grid-cols-[1fr_100px] items-center gap-1">
                <Label className="text-sm text-left font-bold">Total</Label>
                <Input type="number" value={total.toFixed(2)} className="h-7 text-sm font-bold bg-muted w-full" readOnly />
            </div>
            <div className="grid grid-cols-[auto_1fr_100px] items-center gap-2">
                <Label className="text-sm text-left col-start-1">GST</Label>
                <div className="relative">
                    <Input 
                        type="number" 
                        value={gstValue} 
                        onChange={(e) => setGstValue(parseFloat(e.target.value) || 0)} 
                        className="h-7 text-sm pr-6" 
                        disabled={!isGstApplicable}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-sm text-muted-foreground">%</span>
                </div>
                <Input 
                    type="number" 
                    value={gstAmount.toFixed(2)} 
                    className="h-7 text-sm bg-muted" 
                    readOnly 
                />
            </div>
            <Separator />
            <div className="grid grid-cols-[1fr_100px] items-center gap-1">
                <Label className="text-sm text-left font-bold">Grand Total:</Label>
                <Input value={grandTotal.toFixed(2)} className="h-8 text-sm font-bold text-red-600 bg-red-50 border-red-200 text-center w-full" readOnly />
            </div>
        </div>
    </Card>
  );
}

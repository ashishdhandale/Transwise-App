
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChargeSetting } from '@/components/company/settings/additional-charges-settings';

const LOCAL_STORAGE_KEY = 'transwise_additional_charges_settings';

const ChargeInput = ({ label, value, readOnly = false, type = 'number', onChange }: { label: string, value: string | number, readOnly?: boolean, type?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="grid grid-cols-[1fr_100px] items-center gap-2">
        <Label className="text-sm text-left whitespace-nowrap overflow-hidden text-ellipsis">{label}</Label>
        <Input type={type} value={value} readOnly={readOnly} className="h-7 text-sm w-full" onChange={onChange} />
    </div>
)

interface ChargesSectionProps {
    basicFreight: number;
    onGrandTotalChange: (total: number) => void;
    initialGrandTotal?: number;
    isGstApplicable: boolean;
    onChargesChange: (charges: { [key: string]: number }) => void;
    initialCharges?: { [key: string]: number };
}

export function ChargesSection({ basicFreight, onGrandTotalChange, initialGrandTotal, isGstApplicable, onChargesChange: notifyParentOfChanges, initialCharges }: ChargesSectionProps) {
    const [chargeSettings, setChargeSettings] = useState<ChargeSetting[]>([]);
    const [bookingCharges, setBookingCharges] = useState<{ [key: string]: number }>({});
    const [gstValue, setGstValue] = useState(0);
    const [gstAmount, setGstAmount] = useState(0);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.charges) {
                    setChargeSettings(parsed.charges);
                    // Initialize booking charges from settings
                    const initialChargesFromSettings = parsed.charges.reduce((acc: any, charge: ChargeSetting) => {
                        acc[charge.id] = Number(charge.value) || 0;
                        return acc;
                    }, {});
                    
                    if (initialCharges) {
                        setBookingCharges({...initialChargesFromSettings, ...initialCharges});
                    } else {
                        setBookingCharges(initialChargesFromSettings);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load additional charges settings", error);
        }
    }, [initialCharges]);
    
    const handleChargeChange = (chargeId: string, value: string) => {
        const newBookingCharges = { ...bookingCharges, [chargeId]: Number(value) || 0 };
        setBookingCharges(newBookingCharges);
        notifyParentOfChanges(newBookingCharges);
    };
    
    const additionalChargesTotal = useMemo(() => {
        return chargeSettings
            .filter(c => c.isVisible)
            .reduce((sum, charge) => sum + (bookingCharges[charge.id] || 0), 0);
    }, [chargeSettings, bookingCharges]);

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

    useEffect(() => {
        if (initialGrandTotal !== undefined) {
            const subtotal = initialGrandTotal;
            const chargesTotal = chargeSettings.filter(c => c.isVisible).reduce((sum, charge) => sum + (bookingCharges[charge.id] || 0), 0);
            
            if (subtotal > 0 && subtotal > basicFreight + chargesTotal) {
                 const inferredGstAmount = subtotal - (basicFreight + chargesTotal);
                 const inferredGstRate = (inferredGstAmount / (basicFreight + chargesTotal)) * 100;
                 if (inferredGstRate > 0 && inferredGstRate < 100) {
                     setGstValue(Math.round(inferredGstRate));
                 }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialGrandTotal, basicFreight, chargeSettings]);


  return (
    <Card className="p-2 border-cyan-200 h-full flex flex-col">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Additional Charges</h3>
        <div className="space-y-1.5 flex-grow">
             <ChargeInput label="Basic Freight" value={basicFreight.toFixed(2)} readOnly={true} />
            {chargeSettings.filter(c => c.isVisible).map((charge) => (
                <ChargeInput 
                    key={charge.id} 
                    label={charge.name} 
                    value={bookingCharges[charge.id] || 0}
                    readOnly={!charge.isEditable}
                    onChange={(e) => handleChargeChange(charge.id, e.target.value)}
                />
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
            <div className="grid grid-cols-[1fr_100px] items-center gap-2">
                <Label className="text-sm text-left font-bold">Grand Total:</Label>
                <Input value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grandTotal)} className="h-8 text-sm font-bold text-red-600 bg-red-50 border-red-200 text-center w-full" readOnly />
            </div>
        </div>
    </Card>
  );
}

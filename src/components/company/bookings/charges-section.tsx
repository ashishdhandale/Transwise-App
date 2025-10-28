

'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChargeSetting } from '@/components/company/settings/additional-charges-settings';
import { loadCompanySettingsFromStorage, type AllCompanySettings } from '@/app/company/settings/actions';
import type { ItemRow } from './item-details-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const calculationTypes: { value: ChargeSetting['calculationType'], label: string }[] = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'per_kg_actual', label: 'Per Kg (Act. Wt)' },
    { value: 'per_kg_charge', label: 'Per Kg (Chg. Wt)' },
    { value: 'per_quantity', label: 'Per Pkg' },
];

interface ChargesSectionProps {
    itemRows: ItemRow[];
    onGrandTotalChange: (total: number) => void;
    onChargesChange: (charges: { [key: string]: number; }) => void;
    initialCharges?: { [key: string]: number };
    isGstApplicable: boolean;
    isViewOnly?: boolean;
}

export function ChargesSection({ 
    itemRows, 
    onGrandTotalChange, 
    onChargesChange,
    initialCharges, 
    isGstApplicable, 
    isViewOnly = false,
}: ChargesSectionProps) {
    const [chargeSettings, setChargeSettings] = useState<ChargeSetting[]>([]);
    const [bookingCharges, setBookingCharges] = useState<{ [key:string]: number }>({});
    const [gstValue, setGstValue] = useState(0);
    const [gstAmount, setGstAmount] = useState(0);
    const [profile, setProfile] = useState<AllCompanySettings | null>(null);
    
    const [liveCalc, setLiveCalc] = useState<{[key: string]: { rate: number; type: ChargeSetting['calculationType'] } }>({});

    useEffect(() => {
        const loadedProfile = loadCompanySettingsFromStorage();
        setProfile(loadedProfile);
        
        if (loadedProfile?.additionalCharges) {
            const visibleCharges = loadedProfile.additionalCharges.filter(c => c.isVisible);
            setChargeSettings(visibleCharges);
            
            const initialBookingCharges: { [key: string]: number } = {};
            const initialLiveCalc: typeof liveCalc = {};

            visibleCharges.forEach(charge => {
                initialBookingCharges[charge.id] = initialCharges?.[charge.id] ?? charge.value ?? 0;
                if (charge.isEditable) {
                    initialLiveCalc[charge.id] = {
                        rate: initialCharges?.[charge.id] && charge.calculationType === 'fixed' ? initialCharges[charge.id] : (charge.value || 0),
                        type: charge.calculationType,
                    };
                }
            });
            setBookingCharges(initialBookingCharges);
            setLiveCalc(initialLiveCalc);
        }
    }, [initialCharges]);
    
    const handleLiveCalcChange = (chargeId: string, field: 'rate' | 'type', value: string | number) => {
         const newLiveCalcState = {
            ...liveCalc,
            [chargeId]: {
                ...(liveCalc[chargeId] || { rate: 0, type: 'fixed' }),
                [field]: value,
            },
        };
        setLiveCalc(newLiveCalcState);
    }
    
    useEffect(() => {
        let hasChanged = false;
        const newCharges = { ...bookingCharges };

        chargeSettings.forEach(charge => {
            if (charge.isEditable) { 
                const calcDetails = liveCalc[charge.id];
                if (calcDetails && itemRows) {
                    let calculatedValue = 0;
                    const { rate, type } = calcDetails;
                     switch (type) {
                        case 'fixed': calculatedValue = rate; break;
                        case 'per_kg_actual': calculatedValue = itemRows.reduce((sum, row) => sum + (parseFloat(row.actWt) || 0), 0) * rate; break;
                        case 'per_kg_charge': calculatedValue = itemRows.reduce((sum, row) => sum + (parseFloat(row.chgWt) || 0), 0) * rate; break;
                        case 'per_quantity': calculatedValue = itemRows.reduce((sum, row) => sum + (parseInt(row.qty, 10) || 0), 0) * rate; break;
                    }
                    if (newCharges[charge.id] !== calculatedValue) {
                        newCharges[charge.id] = calculatedValue;
                        hasChanged = true;
                    }
                }
            }
        });

        if (hasChanged) {
            onChargesChange(newCharges);
        }
    }, [itemRows, chargeSettings, liveCalc, bookingCharges, onChargesChange]);

    const handleManualChargeChange = (chargeId: string, value: string) => {
        const numericValue = Number(value) || 0;
        const newCharges = { ...bookingCharges, [chargeId]: numericValue };
        onChargesChange(newCharges);
    };
    
    const basicFreight = useMemo(() => {
        if (!itemRows) return 0;
        return (itemRows || []).reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);
    
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
                 <div key={charge.id} className="grid grid-cols-[1fr_auto] items-center gap-x-2">
                    <Label className="text-sm text-left whitespace-nowrap overflow-hidden text-ellipsis h-7 flex items-center">{charge.name}</Label>
                    
                    {charge.isEditable && !isViewOnly ? (
                        <div className="grid grid-cols-[80px_100px_100px] items-center gap-1">
                            <Input
                                type="number"
                                placeholder="Rate"
                                value={liveCalc[charge.id]?.rate ?? charge.value ?? ''}
                                onChange={(e) => handleLiveCalcChange(charge.id, 'rate', e.target.value)}
                                className="h-7 text-xs"
                            />
                            <Select
                                value={liveCalc[charge.id]?.type ?? charge.calculationType}
                                onValueChange={(v) => handleLiveCalcChange(charge.id, 'type', v)}
                            >
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {calculationTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input 
                                type="number" 
                                value={bookingCharges[charge.id]?.toFixed(2) || '0.00'}
                                onChange={(e) => handleManualChargeChange(charge.id, e.target.value)}
                                className="h-7 text-sm w-full bg-card" 
                            />
                        </div>
                    ) : (
                         <div className="grid grid-cols-1 w-[100px]">
                            <Input 
                                type="number" 
                                value={bookingCharges[charge.id] ?? ''}
                                onChange={(e) => handleManualChargeChange(charge.id, e.target.value)}
                                readOnly={isViewOnly || charge.isEditable}
                                className="h-7 text-sm bg-card justify-self-end" 
                            />
                        </div>
                    )}
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
                        disabled={!isGstApplicable || isViewOnly}
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

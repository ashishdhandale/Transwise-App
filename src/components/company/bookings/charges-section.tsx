

'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChargeSetting } from '@/components/company/settings/additional-charges-settings';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import type { ItemRow } from './item-details-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const calculationTypes: { value: ChargeSetting['calculationType'], label: string }[] = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'per_kg_actual', label: 'Per Kg (Act. Wt)' },
    { value: 'per_kg_charge', label: 'Per Kg (Chg. Wt)' },
    { value: 'per_quantity', label: 'Per Pkg' },
];

interface ChargesSectionProps {
    basicFreight: number;
    onGrandTotalChange: (total: number) => void;
    initialGrandTotal?: number;
    isGstApplicable: boolean;
    onChargesChange: (charges: { [key: string]: number }) => void;
    initialCharges?: { [key: string]: number };
    profile: AllCompanySettings | null;
    isViewOnly?: boolean;
    itemRows: ItemRow[];
}

export function ChargesSection({ 
    basicFreight, 
    onGrandTotalChange, 
    initialGrandTotal, 
    isGstApplicable, 
    onChargesChange: notifyParentOfChanges, 
    initialCharges, 
    profile, 
    isViewOnly = false,
    itemRows,
}: ChargesSectionProps) {
    const [chargeSettings, setChargeSettings] = useState<ChargeSetting[]>([]);
    const [bookingCharges, setBookingCharges] = useState<{ [key:string]: number }>({});
    const [gstValue, setGstValue] = useState(0);
    const [gstAmount, setGstAmount] = useState(0);
    
    const [liveCalc, setLiveCalc] = useState<{[key: string]: { rate: number; type: ChargeSetting['calculationType'] } }>({});

    useEffect(() => {
      if (profile?.additionalCharges) {
        setChargeSettings(profile.additionalCharges.filter(c => c.isVisible));
      }
    }, [profile]);
    
    const handleLiveCalcChange = (chargeId: string, field: 'rate' | 'type', value: string | number) => {
         setLiveCalc(prev => {
            const current = prev[chargeId] || { 
                rate: chargeSettings.find(c => c.id === chargeId)?.value || 0,
                type: chargeSettings.find(c => c.id === chargeId)?.calculationType || 'fixed'
            };
            const numericValue = field === 'rate' ? Number(value) : value;
            return {
                ...prev,
                [chargeId]: { ...current, [field]: numericValue }
            };
        });
    }

    const calculateCharge = useCallback((charge: ChargeSetting, currentLiveCalc: typeof liveCalc) => {
        const calcDetails = currentLiveCalc[charge.id];
        const rate = calcDetails ? calcDetails.rate : charge.value || 0;
        const type = calcDetails ? calcDetails.type : charge.calculationType;
        
        switch (type) {
            case 'fixed': return rate;
            case 'per_kg_actual': return itemRows.reduce((sum, row) => sum + (parseFloat(row.actWt) || 0), 0) * rate;
            case 'per_kg_charge': return itemRows.reduce((sum, row) => sum + (parseFloat(row.chgWt) || 0), 0) * rate;
            case 'per_quantity': return itemRows.reduce((sum, row) => sum + (parseInt(row.qty, 10) || 0), 0) * rate;
            default: return 0;
        }
    }, [itemRows]);

    useEffect(() => {
        const newBookingCharges: { [key: string]: number } = {};
        
        chargeSettings.forEach(charge => {
             if (charge.isEditable) {
                newBookingCharges[charge.id] = calculateCharge(charge, liveCalc);
            } else if (initialCharges && initialCharges[charge.id] !== undefined) {
                newBookingCharges[charge.id] = initialCharges[charge.id];
            } else {
                newBookingCharges[charge.id] = charge.value || 0;
            }
        });
        
        if (JSON.stringify(newBookingCharges) !== JSON.stringify(bookingCharges)) {
            setBookingCharges(newBookingCharges);
        }

    }, [chargeSettings, itemRows, calculateCharge, liveCalc, initialCharges, bookingCharges]);
    
    useEffect(() => {
        notifyParentOfChanges(bookingCharges);
    }, [bookingCharges, notifyParentOfChanges]);
    
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

    useEffect(() => {
        if (initialGrandTotal !== undefined && isGstApplicable) {
            const currentSubTotal = basicFreight + additionalChargesTotal;
            if (initialGrandTotal > 0 && currentSubTotal > 0) {
                 const inferredGstAmount = initialGrandTotal - currentSubTotal;
                 const inferredGstRate = (inferredGstAmount / currentSubTotal) * 100;
                 if (inferredGstRate > 0 && inferredGstRate < 100) {
                     setGstValue(Math.round(inferredGstRate));
                 }
            }
        }
    }, [initialGrandTotal, isGstApplicable, basicFreight, additionalChargesTotal]);

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
                                readOnly
                                className="h-7 text-sm w-full bg-muted" 
                            />
                        </div>
                    ) : (
                        <Input 
                            type="number" 
                            value={bookingCharges[charge.id] || ''}
                            readOnly={isViewOnly}
                            className="h-7 text-sm w-[100px] bg-muted/50 justify-self-end" 
                            onChange={(e) => {
                                if (isViewOnly) return;
                                setBookingCharges(prev => ({...prev, [charge.id]: Number(e.target.value) || 0 }))
                            }}
                        />
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


'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChargeSetting } from '@/components/company/settings/additional-charges-settings';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import type { ItemRow } from './item-details-table';

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
    profile: CompanyProfileFormValues | null;
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
                }
            } else {
                setChargeSettings([]);
            }
        } catch (error) {
            console.error("Failed to load additional charges settings", error);
        }
    }, []);

    const calculateCharge = useCallback((charge: ChargeSetting) => {
        const rate = charge.value || 0;
        switch (charge.calculationType) {
            case 'fixed':
                return rate;
            case 'per_kg_actual':
                const totalActWt = itemRows.reduce((sum, row) => sum + (parseFloat(row.actWt) || 0), 0);
                return totalActWt * rate;
            case 'per_kg_charge':
                const totalChgWt = itemRows.reduce((sum, row) => sum + (parseFloat(row.chgWt) || 0), 0);
                return totalChgWt * rate;
            case 'per_quantity':
                 const totalQty = itemRows.reduce((sum, row) => sum + (parseInt(row.qty, 10) || 0), 0);
                return totalQty * rate;
            default:
                return 0;
        }
    }, [itemRows]);

    useEffect(() => {
        const newBookingCharges: { [key: string]: number } = {};
        chargeSettings.forEach(charge => {
            if (charge.isEditable && initialCharges && initialCharges[charge.id] !== undefined) {
                 newBookingCharges[charge.id] = initialCharges[charge.id];
            } else {
                 newBookingCharges[charge.id] = calculateCharge(charge);
            }
        });
        setBookingCharges(newBookingCharges);
        notifyParentOfChanges(newBookingCharges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chargeSettings, itemRows, calculateCharge, initialCharges]);
    
    const handleChargeChange = (chargeId: string, value: string) => {
        const newBookingCharges = { ...bookingCharges, [chargeId]: Number(value) || 0 };
        setBookingCharges(newBookingCharges);
        notifyParentOfChanges(newBookingCharges);
    };
    
    const additionalChargesTotal = useMemo(() => {
        return Object.values(bookingCharges).reduce((sum, charge) => sum + charge, 0);
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
                 if (inferredGstRate > 0 && inferredGstRate < 100) { // Plausibility check
                     setGstValue(Math.round(inferredGstRate));
                 }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialGrandTotal, basicFreight, additionalChargesTotal, isGstApplicable]);


  return (
    <Card className="p-2 border-cyan-200 h-full flex flex-col">
        <h3 className="text-center font-semibold text-blue-600 mb-2 border-b-2 border-dotted border-cyan-300 pb-1 text-sm">Additional Charges</h3>
        <div className="space-y-1.5 flex-grow">
             <ChargeInput label="Basic Freight" value={basicFreight.toFixed(2)} readOnly={true} />
            {chargeSettings.filter(c => c.isVisible).map((charge) => (
                <ChargeInput 
                    key={charge.id} 
                    label={charge.name} 
                    value={bookingCharges[charge.id]?.toFixed(2) || '0.00'}
                    readOnly={!charge.isEditable || isViewOnly}
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
            <div className="grid grid-cols-[1fr_100px] items-center gap-2">
                <Label className="text-sm text-left font-bold">Grand Total:</Label>
                <Input value={grandTotal.toFixed(2)} className="h-8 text-sm font-bold text-red-600 bg-red-50 border-red-200 text-center w-full" readOnly />
            </div>
        </div>
    </Card>
  );
}

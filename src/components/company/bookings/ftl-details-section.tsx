
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FtlDetails } from '@/lib/bookings-dashboard-data';

interface FtlDetailsSectionProps {
    details: FtlDetails;
    onDetailsChange: (details: FtlDetails) => void;
}

export function FtlDetailsSection({ details, onDetailsChange }: FtlDetailsSectionProps) {
    
    const handleChange = (field: keyof FtlDetails, value: string | number) => {
        onDetailsChange({ ...details, [field]: value });
    };

    return (
        <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="p-3">
                <CardTitle className="text-base text-orange-700 font-headline">FTL (Full Truck Load) Details</CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="vehicleNo">Vehicle No</Label>
                    <Input id="vehicleNo" value={details.vehicleNo} onChange={e => handleChange('vehicleNo', e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input id="driverName" value={details.driverName} onChange={e => handleChange('driverName', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="lorrySupplier">Lorry Supplier</Label>
                    <Input id="lorrySupplier" value={details.lorrySupplier} onChange={e => handleChange('lorrySupplier', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="truckFreight">Truck Freight</Label>
                    <Input id="truckFreight" type="number" value={details.truckFreight} onChange={e => handleChange('truckFreight', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="advance">Advance</Label>
                    <Input id="advance" type="number" value={details.advance} onChange={e => handleChange('advance', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="commission">Deduction: Commission</Label>
                    <Input id="commission" type="number" value={details.commission} onChange={e => handleChange('commission', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="otherDeductions">Deduction: Others</Label>
                    <Input id="otherDeductions" type="number" value={details.otherDeductions} onChange={e => handleChange('otherDeductions', parseFloat(e.target.value) || 0)} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="balance">Balance</Label>
                    <Input id="balance" type="number" value={details.truckFreight - details.advance} readOnly className="font-bold bg-muted" />
                </div>
            </CardContent>
        </Card>
    );
}

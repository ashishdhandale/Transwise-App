
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Challan } from '@/lib/challan-data';

interface ChallanDetailsProps {
    challan: Challan;
}

const DetailItem = ({ label, value, isEmphasized = false }: { label: string; value: string; isEmphasized?: boolean }) => (
    <div>
        <span className="text-sm text-muted-foreground">{label}: </span>
        <span className={isEmphasized ? 'font-bold text-red-600 text-sm' : 'text-sm font-semibold'}>
            {value}
        </span>
    </div>
);

export function ChallanDetails({ challan }: ChallanDetailsProps) {
    return (
        <Card className="border-primary/50">
            <CardHeader className="p-2 border-b">
                <CardTitle className="text-sm">Challan Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4">
                    {/* Column 1: Challan Info */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm border-b pb-1">Challan Information</h4>
                        <DetailItem label="Challan No" value={challan.challanId} isEmphasized />
                        <DetailItem label="Challan Type" value={challan.challanType} isEmphasized />
                        <DetailItem label="Dispatch Date" value={challan.dispatchDate} isEmphasized />
                        <DetailItem label="Inward Date" value={challan.inwardDate} isEmphasized />
                         <DetailItem label="From Station" value={challan.fromStation} />
                        <DetailItem label="To Station" value={challan.toStation} />
                    </div>
                    {/* Column 2: Vehicle & Driver */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm border-b pb-1">Vehicle & Driver</h4>
                        <DetailItem label="Vehicle No." value={challan.vehicleNo} isEmphasized />
                        <DetailItem label="Driver Name" value={challan.driverName} />
                        <DetailItem label="Veh.hire Freight" value={challan.vehicleHireFreight.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                        <DetailItem label="Advance" value={challan.advance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                        <DetailItem label="Balance" value={challan.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                    </div>
                    {/* Column 3: Shipment Summary */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm border-b pb-1">Shipment Summary</h4>
                        <DetailItem label="Total LR" value={challan.totalLr.toString()} />
                        <DetailItem label="Total Pkgs" value={challan.totalPackages.toString()} />
                        <DetailItem label="Total Items" value={challan.totalItems.toString()} />
                        <DetailItem label="Total Act.Wt" value={`${challan.totalActualWeight} kg`} />
                        <DetailItem label="Total Chg.Wt" value={`${challan.totalChargeWeight} kg`} />
                    </div>
                    {/* Column 4 - Actions */}
                    <div className="space-y-2">
                         <h4 className="font-semibold text-sm border-b pb-1">Actions</h4>
                        <div className="flex flex-col items-start">
                            <Button variant="link" className="p-0 h-auto text-blue-600 hover:underline">Print Duplicate Copy</Button>
                            <Button variant="link" className="p-0 h-auto text-blue-600 hover:underline">Modify</Button>
                            <Button variant="link" className="p-0 h-auto text-blue-600 hover:underline">Hold</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

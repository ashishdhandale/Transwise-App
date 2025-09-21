
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Challan } from '@/lib/challan-data';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';

interface ChallanDetailsProps {
    challan: Challan;
    profile: CompanyProfileFormValues | null;
}

const DetailItem = ({ label, value, isEmphasized = false, isCurrency = false, profile }: { label: string; value: string | number; isEmphasized?: boolean, isCurrency?: boolean, profile: CompanyProfileFormValues | null }) => (
    <div>
        <span className="text-sm text-muted-foreground">{label}: </span>
        <span className={isEmphasized ? 'font-bold text-red-600 text-sm' : 'text-sm font-semibold'}>
            {isCurrency && profile ? (Number(value)).toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
        </span>
    </div>
);

export function ChallanDetails({ challan, profile }: ChallanDetailsProps) {
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
                        <DetailItem label="Challan No" value={challan.challanId} isEmphasized profile={profile} />
                        <DetailItem label="Challan Type" value={challan.challanType} isEmphasized profile={profile} />
                        <DetailItem label="Dispatch Date" value={challan.dispatchDate} isEmphasized profile={profile} />
                        <DetailItem label="Inward Date" value={challan.inwardDate} isEmphasized profile={profile} />
                         <DetailItem label="From Station" value={challan.fromStation} profile={profile} />
                        <DetailItem label="To Station" value={challan.toStation} profile={profile} />
                    </div>
                    {/* Column 2: Vehicle & Driver */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm border-b pb-1">Vehicle & Driver</h4>
                        <DetailItem label="Vehicle No." value={challan.vehicleNo} isEmphasized profile={profile} />
                        <DetailItem label="Driver Name" value={challan.driverName} profile={profile} />
                        <DetailItem label="Veh.hire Freight" value={challan.vehicleHireFreight} isCurrency profile={profile} />
                        <DetailItem label="Advance" value={challan.advance} isCurrency profile={profile} />
                        <DetailItem label="Balance" value={challan.balance} isCurrency profile={profile} />
                    </div>
                    {/* Column 3: Shipment Summary */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm border-b pb-1">Shipment Summary</h4>
                        <DetailItem label="Total LR" value={challan.totalLr.toString()} profile={profile} />
                        <DetailItem label="Total Pkgs" value={challan.totalPackages.toString()} profile={profile} />
                        <DetailItem label="Total Items" value={challan.totalItems.toString()} profile={profile} />
                        <DetailItem label="Total Act.Wt" value={`${challan.totalActualWeight} kg`} profile={profile} />
                        <DetailItem label="Total Chg.Wt" value={`${challan.totalChargeWeight} kg`} profile={profile} />
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

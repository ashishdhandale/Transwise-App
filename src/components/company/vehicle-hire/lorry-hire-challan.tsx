

'use client';

import type { VehicleHireReceipt } from '@/lib/vehicle-hire-data';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';
import { format } from 'date-fns';

interface LorryHireChallanProps {
    receipt: VehicleHireReceipt;
    profile: CompanyProfileFormValues;
}

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="flex text-sm py-1">
        <p className="w-32 font-semibold">{label}</p>
        <p className="flex-1 font-bold">: {value}</p>
    </div>
);

export function LorryHireChallan({ receipt, profile }: LorryHireChallanProps) {
    return (
        <div className="p-6 font-sans text-sm text-black bg-white" style={{ width: '210mm' }}>
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-xl font-bold">{profile.companyName}</h1>
                <p className="text-xs">{profile.headOfficeAddress}</p>
                <p className="text-xs">Ph: {profile.companyContactNo} | Email: {profile.companyEmail}</p>
                <p className="text-base font-bold underline mt-4">LORRY HIRE CHALLAN</p>
            </header>

            <div className="grid grid-cols-2 gap-x-4 border-y-2 border-black py-2 my-4">
                <div>
                    <DetailRow label="Receipt No" value={receipt.receiptNo} />
                    <DetailRow label="Date" value={format(new Date(receipt.date), 'dd-MMM-yyyy')} />
                    <DetailRow label="Vehicle No" value={receipt.vehicleNo} />
                    <DetailRow label="Vehicle Type" value={receipt.vehicleType} />
                    <DetailRow label="Driver Name" value={receipt.driverName} />
                </div>
                <div>
                    <DetailRow label="Supplier" value={receipt.supplierName} />
                    <DetailRow label="From" value={receipt.fromStation} />
                    <DetailRow label="To" value={receipt.toStation} />
                    <DetailRow label="Capacity" value={`${receipt.capacity || 0} Kg`} />
                </div>
            </div>

            <div className="mt-4 p-4 border border-black space-y-2">
                 <DetailRow label="Freight Amount" value={receipt.freight.toFixed(2)} />
                 <DetailRow label="Advance Paid" value={receipt.advance.toFixed(2)} />
                 <DetailRow label="Balance" value={receipt.balance.toFixed(2)} />
            </div>
            
             <div className="mt-4">
                <p className="font-semibold">Remarks:</p>
                <p className="text-xs min-h-[40px] whitespace-pre-line">{receipt.remarks}</p>
            </div>

            <footer className="grid grid-cols-2 gap-4 mt-16 pt-16 text-sm">
                 <div className="text-center">
                    <p className="pt-1 border-t border-black">Driver's Signature</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold">For {profile.companyName}</p>
                    <p className="pt-1 border-t border-black mt-12">Authorised Signatory</p>
                </div>
            </footer>
        </div>
    );
}

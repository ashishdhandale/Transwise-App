
'use client';

import type { Challan, LrDetail } from '@/lib/challan-data';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import React from 'react';
import { format } from 'date-fns';

interface InwardChallanProps {
    challan: Challan;
    lrDetails: LrDetail[];
    profile: AllCompanySettings | null;
}

const thClass = "text-left text-xs font-bold text-black border border-black p-1";
const tdClass = "text-xs border border-black p-1 align-top";

export function InwardChallan({ challan, lrDetails, profile }: InwardChallanProps) {
    const totalPackages = lrDetails.reduce((sum, lr) => sum + lr.quantity, 0);
    const totalActualWeight = lrDetails.reduce((sum, lr) => sum + lr.actualWeight, 0);
    const totalChargeWeight = lrDetails.reduce((sum, lr) => sum + lr.chargeWeight, 0);
    const totalAmount = lrDetails.reduce((sum, lr) => sum + lr.grandTotal, 0);

    const formatValue = (amount: number) => {
        if (!profile) return amount.toFixed(2);
        return amount.toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="p-4 font-sans text-black bg-white uppercase">
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-xl font-bold">{profile?.companyName}</h1>
                <p className="text-xs">{profile?.headOfficeAddress}</p>
                <p className="text-xs">GSTIN: {profile?.gstNo} | Ph: {profile?.companyContactNo}</p>
                <p className="text-sm font-bold underline">INWARD CHALLAN</p>
            </header>
            
            <div className="grid grid-cols-2 gap-x-4 text-xs border-y border-black py-2">
                <div>
                    <p><span className="font-semibold">Inward No:</span> {challan.inwardId}</p>
                    <p><span className="font-semibold">Original Challan:</span> {challan.originalChallanNo || 'N/A'}</p>
                    <p><span className="font-semibold">From:</span> {challan.fromStation}</p>
                    <p><span className="font-semibold">Received From:</span> {challan.receivedFromParty}</p>
                </div>
                <div>
                    <p><span className="font-semibold">Inward Date:</span> {format(new Date(challan.inwardDate), 'dd-MMM-yyyy')}</p>
                    <p><span className="font-semibold">Vehicle No:</span> {challan.vehicleNo}</p>
                    <p><span className="font-semibold">Driver:</span> {challan.driverName}</p>
                </div>
            </div>

            <div className="mt-2">
                <Table className="border-collapse border border-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>LR No</TableHead>
                            <TableHead className={thClass}>Booking Date</TableHead>
                            <TableHead className={thClass}>Consignee</TableHead>
                            <TableHead className={thClass}>Pkgs</TableHead>
                            <TableHead className={thClass}>Contents</TableHead>
                            <TableHead className={thClass}>Booking Type</TableHead>
                            <TableHead className={`${thClass} text-right`}>Actual Wt.</TableHead>
                            <TableHead className={`${thClass} text-right`}>Charge Wt.</TableHead>
                            <TableHead className={`${thClass} text-right`}>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lrDetails.map((lr) => (
                            <TableRow key={lr.lrNo}>
                                <TableCell className={tdClass}>{lr.lrNo}</TableCell>
                                <TableCell className={tdClass}>{format(new Date(lr.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                <TableCell className={tdClass}>{lr.receiver.name}</TableCell>
                                <TableCell className={`${tdClass} text-center`}>{lr.quantity}</TableCell>
                                <TableCell className={tdClass}>{lr.itemDescription}</TableCell>
                                <TableCell className={tdClass}>{lr.lrType}</TableCell>
                                <TableCell className={`${tdClass} text-right`}>{lr.actualWeight.toFixed(2)}</TableCell>
                                <TableCell className={`${tdClass} text-right`}>{lr.chargeWeight.toFixed(2)}</TableCell>
                                <TableCell className={`${tdClass} text-right`}>{formatValue(lr.grandTotal)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold">
                            <TableCell className={`${tdClass} text-right`} colSpan={3}>TOTAL:</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalPackages}</TableCell>
                            <TableCell className={tdClass} colSpan={2}></TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalActualWeight.toFixed(2)}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalChargeWeight.toFixed(2)}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{formatValue(totalAmount)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="mt-2 border border-black p-2">
                <h3 className="font-bold underline text-xs mb-1">Remarks</h3>
                <p className="text-xs min-h-[40px] whitespace-pre-line">{challan.remark || 'No remarks.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 pt-12 text-xs">
                <div className="text-center">
                    <p className="pt-1 border-t border-black">Driver Signature</p>
                </div>
                 <div className="text-center">
                    <p className="pt-1 border-t border-black">Receiving Incharge</p>
                </div>
            </div>
        </div>
    );
}

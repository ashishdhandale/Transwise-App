
'use client';

import type { Challan } from '@/lib/challan-data';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import type { Booking } from '@/lib/bookings-dashboard-data';
import React from 'react';

interface LoadingSlipProps {
    challan: Challan;
    bookings: Booking[];
    profile: CompanyProfileFormValues;
    driverMobile?: string;
    remark: string;
}

const thClass = "text-left text-xs font-bold text-black border border-black";
const tdClass = "text-xs border border-black p-1";
const subRowTdClass = "text-xs border-b border-l border-r border-dashed p-1 pl-4";


export function LoadingSlip({ challan, bookings, profile, driverMobile, remark }: LoadingSlipProps) {

    const totalPackages = bookings.reduce((sum, lr) => sum + lr.qty, 0);
    const totalWeight = bookings.reduce((sum, lr) => sum + lr.itemRows.reduce((itemSum, item) => itemSum + Number(item.actWt), 0), 0);
    const totalItems = bookings.reduce((sum, lr) => sum + lr.itemRows.length, 0);
    const grandTotalAmount = bookings.reduce((sum, lr) => sum + lr.totalAmount, 0);

    const title = challan.status === 'Finalized' ? 'DISPATCH CHALLAN' : 'LOADING SLIP';

    const formatValue = (amount: number) => {
        if (!profile) return amount.toFixed(2);
        return amount.toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="p-4 font-sans text-black bg-white">
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-lg font-bold">{profile.companyName}</h1>
                <p className="text-xs">{profile.headOfficeAddress}</p>
                <p className="text-sm font-bold underline">{title}</p>
            </header>
            
            <div className="grid grid-cols-2 gap-x-4 text-xs border-y border-black py-2">
                <div>
                    <p><span className="font-semibold">Challan No:</span> {challan.challanId}</p>
                    <p><span className="font-semibold">From:</span> {challan.fromStation}</p>
                    <p><span className="font-semibold">To:</span> {challan.toStation}</p>
                </div>
                <div>
                    <p><span className="font-semibold">Date:</span> {challan.dispatchDate}</p>
                    <p><span className="font-semibold">Vehicle No:</span> {challan.vehicleNo}</p>
                    <p><span className="font-semibold">Driver:</span> {challan.driverName} {driverMobile && `(${driverMobile})`}</p>
                </div>
            </div>

            <div className="mt-2">
                <Table className="border-collapse border border-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>#</TableHead>
                            <TableHead className={thClass}>LR No</TableHead>
                            <TableHead className={thClass}>LR Type</TableHead>
                            <TableHead className={thClass}>To</TableHead>
                            <TableHead className={thClass}>Consignee</TableHead>
                            <TableHead className={thClass}>Item & Description</TableHead>
                            <TableHead className={thClass}>Pkgs</TableHead>
                            <TableHead className={thClass}>Act. Wt.</TableHead>
                            <TableHead className={`${thClass} text-right`}>Grand Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((lr, index) => (
                           <React.Fragment key={lr.trackingId}>
                                <TableRow className="bg-muted/30">
                                    <TableCell className={tdClass}>{index + 1}</TableCell>
                                    <TableCell className={tdClass}>{lr.lrNo}</TableCell>
                                    <TableCell className={tdClass}>{lr.lrType}</TableCell>
                                    <TableCell className={tdClass}>{lr.toCity}</TableCell>
                                    <TableCell className={tdClass}>{lr.receiver}</TableCell>
                                    <TableCell className={tdClass}></TableCell>
                                    <TableCell className={`${tdClass} text-center`}></TableCell>
                                    <TableCell className={`${tdClass} text-right`}></TableCell>
                                    <TableCell className={`${tdClass} text-right`}></TableCell>
                                </TableRow>
                                {lr.itemRows.map((item, itemIndex) => (
                                     <TableRow key={`${lr.trackingId}-${item.id}`}>
                                        <TableCell className={subRowTdClass}></TableCell>
                                        <TableCell className={subRowTdClass}></TableCell>
                                        <TableCell className={subRowTdClass}></TableCell>
                                        <TableCell className={subRowTdClass}></TableCell>
                                        <TableCell className={subRowTdClass}></TableCell>
                                        <TableCell className={subRowTdClass}>{item.itemName} - {item.description}</TableCell>
                                        <TableCell className={`${subRowTdClass} text-center`}>{item.qty}</TableCell>
                                        <TableCell className={`${subRowTdClass} text-right`}>{Number(item.actWt).toFixed(2)}</TableCell>
                                        <TableCell className={`${subRowTdClass} text-right`}>{formatValue(Number(item.lumpsum))}</TableCell>
                                     </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold">
                            <TableCell colSpan={5} className={`${tdClass} text-right`}>TOTAL:</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalItems} Items</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalPackages}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalWeight.toFixed(2)}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{formatValue(grandTotalAmount)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="mt-2 border border-black p-2">
                <h3 className="font-bold underline text-xs mb-1">Remarks / Dispatch Note</h3>
                <p className="text-xs min-h-[60px] whitespace-pre-line">{remark || 'No remarks.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 pt-12 text-xs">
                <div className="text-center">
                    <p className="pt-1 border-t border-black">Driver Signature</p>
                </div>
                 <div className="text-center">
                    <p className="pt-1 border-t border-black">Loading Incharge</p>
                </div>
            </div>
        </div>
    );
}

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
}

const thClass = "text-left text-xs font-bold text-black border border-black p-1";
const tdClass = "text-xs border border-black p-1 align-top";

export function LoadingSlip({ challan, bookings, profile }: LoadingSlipProps) {
    const totalPackages = bookings.reduce((sum, lr) => sum + lr.qty, 0);
    const totalWeight = bookings.reduce((sum, lr) => sum + lr.itemRows.reduce((itemSum, item) => itemSum + Number(item.actWt), 0), 0);

    return (
        <div className="p-4 font-sans text-black bg-white uppercase">
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-xl font-bold">{profile.companyName}</h1>
                <p className="text-xs">{profile.headOfficeAddress}</p>
                <p className="text-sm font-bold underline mt-2">LOADING SLIP</p>
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
                    <p><span className="font-semibold">Driver:</span> {challan.driverName}</p>
                </div>
            </div>

            <div className="mt-2">
                <Table className="border-collapse border border-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>#</TableHead>
                            <TableHead className={thClass}>LR No</TableHead>
                            <TableHead className={thClass}>To</TableHead>
                            <TableHead className={thClass}>Consignee</TableHead>
                            <TableHead className={thClass}>Pkgs</TableHead>
                            <TableHead className={thClass}>Act. Wt.</TableHead>
                            <TableHead className={thClass}>Pvt.Mark</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking, index) => {
                            const totalActWt = booking.itemRows.reduce((sum, item) => sum + Number(item.actWt), 0);
                            const totalQty = booking.itemRows.reduce((sum, item) => sum + Number(item.qty), 0);

                            return (
                                <TableRow key={booking.trackingId}>
                                    <TableCell className={tdClass}>{index + 1}</TableCell>
                                    <TableCell className={tdClass}>{booking.lrNo}</TableCell>
                                    <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                    <TableCell className={tdClass}>{booking.receiver}</TableCell>
                                    <TableCell className={`${tdClass} text-center`}>{totalQty}</TableCell>
                                    <TableCell className={`${tdClass} text-right`}>{totalActWt.toFixed(2)}</TableCell>
                                    <TableCell className={`${tdClass} text-right`}>
                                        {booking.itemRows.map(item => item.pvtMark).filter(Boolean).join(', ')}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold">
                            <TableCell className={`${tdClass} text-right`} colSpan={4}>TOTAL:</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalPackages}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalWeight.toFixed(2)}</TableCell>
                             <TableCell className={tdClass}></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="mt-2 border border-black p-2">
                <h3 className="font-bold underline text-xs mb-1">Remarks / Dispatch Note</h3>
                <p className="text-xs min-h-[40px] whitespace-pre-line">{challan.remark || 'No remarks.'}</p>
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

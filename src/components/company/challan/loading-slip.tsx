

'use client';

import type { Challan } from '@/lib/challan-data';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import type { Booking } from '@/lib/bookings-dashboard-data';
import React from 'react';
import { format, parseISO } from 'date-fns';

interface LoadingSlipProps {
    challan: Challan;
    bookings: Booking[];
    profile: CompanyProfileFormValues;
    driverMobile?: string;
    remark: string;
}

const thClass = "text-left text-xs font-bold text-black border border-black p-1";
const tdClass = "text-xs border border-black p-1 align-top";

const SummaryItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-baseline gap-2 text-xs py-0.5">
        <span className="font-semibold shrink-0">{label}</span>
        <span className="font-bold text-right w-full">{value}</span>
    </div>
);


export function LorryHireChallan({ receipt, profile }: { receipt: any, profile: CompanyProfileFormValues }) {
    return (
        <div className="p-6 font-sans text-sm text-black bg-white" style={{ width: '210mm' }}>
           {/* Lorry Hire Challan Content */}
        </div>
    );
}

export function LoadingSlip({ challan, bookings, profile, driverMobile, remark }: LoadingSlipProps) {
    const totalPackages = bookings.reduce((sum, lr) => sum + lr.qty, 0);
    const totalWeight = bookings.reduce((sum, lr) => sum + lr.itemRows.reduce((itemSum, item) => itemSum + Number(item.actWt), 0), 0);
    
    const challanTotalAmount = bookings.filter(lr => lr.lrType === 'TOPAY').reduce((sum, lr) => sum + lr.totalAmount, 0);

    const paidCount = bookings.filter(b => b.lrType === 'PAID').length;
    const toPayCount = bookings.filter(b => b.lrType === 'TOPAY').length;
    const tbbCount = bookings.filter(b => b.lrType === 'TBB').length;
    const focCount = bookings.filter(b => b.lrType === 'FOC').length;
    const totalLrCount = paidCount + toPayCount + tbbCount + focCount;


    const title = challan.status === 'Finalized' ? 'DISPATCH CHALLAN' : 'LOADING SLIP';

    const formatValue = (amount: number) => {
        if (!profile) return amount.toFixed(2);
        return amount.toLocaleString(profile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="p-4 font-sans text-black bg-white uppercase">
            <header className="text-center pb-2 space-y-1">
                <h1 className="text-xl font-bold">{profile.companyName}</h1>
                <p className="text-xs">{profile.headOfficeAddress}</p>
                <p className="text-xs">GSTIN: {profile.gstNo} | Ph: {profile.companyContactNo}</p>
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
                            <TableHead className={thClass}>From</TableHead>
                            <TableHead className={thClass}>LR No</TableHead>
                            <TableHead className={thClass}>LR Type</TableHead>
                            <TableHead className={thClass}>Consignee</TableHead>
                            <TableHead className={thClass}>To</TableHead>
                            <TableHead className={thClass}>Contents</TableHead>
                            <TableHead className={thClass}>Pkgs</TableHead>
                            <TableHead className={thClass}>Act. Wt.</TableHead>
                            <TableHead className={`${thClass} text-right`}>Topay Amt.</TableHead>
                            <TableHead className={`${thClass} text-right`}>Pvt.Mark</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => {
                            const totalActWt = booking.itemRows.reduce((sum, item) => sum + Number(item.actWt), 0);
                            const totalQty = booking.itemRows.reduce((sum, item) => sum + Number(item.qty), 0);
                            const allItemsDescription = booking.itemRows
                                .map(item => `${item.itemName || ''} - ${item.description || ''}`.replace(/^ - | - $/g, ''))
                                .join(', ');

                            return (
                                <TableRow key={booking.trackingId}>
                                    <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                                    <TableCell className={tdClass}>{booking.lrNo}</TableCell>
                                    <TableCell className={tdClass}>{booking.lrType}</TableCell>
                                    <TableCell className={tdClass}>{booking.receiver}</TableCell>
                                    <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                    <TableCell className={`${tdClass} p-0`}>
                                        <div className="whitespace-pre-wrap p-1">
                                            {allItemsDescription}
                                        </div>
                                    </TableCell>
                                    <TableCell className={`${tdClass} text-center`}>{totalQty}</TableCell>
                                    <TableCell className={`${tdClass} text-right`}>{totalActWt.toFixed(2)}</TableCell>
                                    <TableCell className={`${tdClass} text-right`}>
                                        {booking.lrType === 'TOPAY' ? formatValue(booking.totalAmount) : booking.lrType}
                                    </TableCell>
                                    <TableCell className={`${tdClass} text-right`}>
                                        {booking.itemRows.map(item => item.pvtMark).filter(Boolean).join(', ')}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold">
                            <TableCell className={`${tdClass} text-right`} colSpan={6}>TOTAL:</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalPackages}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalWeight.toFixed(2)}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{formatValue(challanTotalAmount)}</TableCell>
                             <TableCell className={tdClass}></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="border border-black p-2">
                    <h3 className="font-bold underline text-xs mb-1">Remarks / Dispatch Note</h3>
                    <p className="text-xs min-h-[40px] whitespace-pre-line border-b border-dashed pb-2 mb-2">{remark || 'No remarks.'}</p>
                    <div className="space-y-1">
                        <h3 className="font-bold underline text-xs mb-1">Challan Summary</h3>
                        <SummaryItem label="Total LR:" value={
                            <span className="font-bold">
                                {paidCount > 0 && `Paid(${paidCount}) `}
                                {toPayCount > 0 && `Topay(${toPayCount}) `}
                                {tbbCount > 0 && `TBB(${tbbCount}) `}
                                {focCount > 0 && `FOC(${focCount}) `}
                                Total {totalLrCount}
                            </span>
                        } />
                        <SummaryItem label="Total Packages:" value={totalPackages} />
                        <SummaryItem label="Total Actual Wt:" value={`${totalWeight.toFixed(2)} kg`} />
                        <SummaryItem label="Challan Total:" value={formatValue(challanTotalAmount)} />
                    </div>
                </div>
                <div className="border border-black p-2 min-h-[150px]">
                    <h3 className="font-bold underline text-xs mb-1">Challan Calculation</h3>
                    <div className="space-y-1 text-xs">
                        <SummaryItem label="Total ToPay Amount:" value={formatValue(challan.summary.totalTopayAmount)} />
                        <SummaryItem label="Commission:" value={formatValue(challan.summary.commission)} />
                        <SummaryItem label="Labour:" value={formatValue(challan.summary.labour)} />
                        <SummaryItem label="Crossing:" value={formatValue(challan.summary.crossing)} />
                        <SummaryItem label="Carting:" value={formatValue(challan.summary.carting)} />
                        <SummaryItem label="Balance Truck Hire:" value={formatValue(challan.summary.balanceTruckHire)} />
                        <SummaryItem label="Debit/Credit Amount:" value={formatValue(challan.summary.debitCreditAmount)} />
                    </div>
                </div>
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

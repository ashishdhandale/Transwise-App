

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

const SummaryItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between text-xs py-0.5">
        <span className="font-semibold">{label}</span>
        <span className="font-bold">{value}</span>
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
    
    const grandTotalAmount = bookings.reduce((sum, lr) => {
        if (lr.lrType === 'TOPAY' || lr.lrType === 'TBB') {
            return sum + lr.totalAmount;
        }
        return sum;
    }, 0);

    const paidCount = bookings.filter(b => b.lrType === 'PAID').length;
    const toPayCount = bookings.filter(b => b.lrType === 'TOPAY').length;
    const tbbCount = bookings.filter(b => b.lrType === 'TBB').length;
    const focCount = bookings.filter(b => b.lrType === 'FOC').length;


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
                            <TableHead className={thClass}>From</TableHead>
                            <TableHead className={thClass}>To</TableHead>
                            <TableHead className={thClass}>Consignee</TableHead>
                            <TableHead className={thClass}>Item & Description</TableHead>
                            <TableHead className={thClass}>Pkgs</TableHead>
                            <TableHead className={thClass}>Act. Wt.</TableHead>
                            <TableHead className={`${thClass} text-right`}>Grand Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking, lrIndex) => {
                            const totalActWt = booking.itemRows.reduce((sum, item) => sum + Number(item.actWt), 0);
                            const totalQty = booking.itemRows.reduce((sum, item) => sum + Number(item.qty), 0);
                            const isAmountVisible = booking.lrType === 'TOPAY' || booking.lrType === 'TBB';

                            return (
                                <React.Fragment key={booking.trackingId}>
                                    <TableRow>
                                        <TableCell className={`${tdClass} text-center`} rowSpan={booking.itemRows.length || 1}>{lrIndex + 1}</TableCell>
                                        <TableCell className={tdClass} rowSpan={booking.itemRows.length || 1}>{booking.lrNo}</TableCell>
                                        <TableCell className={tdClass} rowSpan={booking.itemRows.length || 1}>{booking.lrType}</TableCell>
                                        <TableCell className={tdClass} rowSpan={booking.itemRows.length || 1}>{booking.fromCity}</TableCell>
                                        <TableCell className={tdClass} rowSpan={booking.itemRows.length || 1}>{booking.toCity}</TableCell>
                                        <TableCell className={tdClass} rowSpan={booking.itemRows.length || 1}>{booking.receiver}</TableCell>

                                        {/* First item row */}
                                        <TableCell className={`${tdClass} p-0`}>
                                             <div className="whitespace-pre-wrap p-1">
                                                <span>
                                                    {booking.itemRows[0]?.itemName || booking.itemRows[0]?.description}
                                                    {booking.itemRows.length > 1 && ` (${booking.itemRows[0]?.qty} Pkgs, ${Number(booking.itemRows[0]?.actWt).toFixed(2)}kg)`}
                                                </span>
                                            </div>
                                        </TableCell>
                                        
                                        <TableCell className={`${tdClass} text-center`} rowSpan={booking.itemRows.length || 1}>{totalQty}</TableCell>
                                        <TableCell className={`${tdClass} text-right`} rowSpan={booking.itemRows.length || 1}>{totalActWt.toFixed(2)}</TableCell>
                                        <TableCell className={`${tdClass} text-right`} rowSpan={booking.itemRows.length || 1}>
                                            {isAmountVisible ? formatValue(booking.totalAmount) : '0.00'}
                                        </TableCell>
                                    </TableRow>
                                    
                                    {/* Subsequent item rows */}
                                    {booking.itemRows.slice(1).map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className={`${tdClass} p-0`}>
                                                <div className="whitespace-pre-wrap p-1 border-t border-black">
                                                    <span>
                                                        {item.itemName || item.description}
                                                        {` (${item.qty} Pkgs, ${Number(item.actWt).toFixed(2)}kg)`}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold">
                            <TableCell colSpan={7} className={`${tdClass} text-right`}>TOTAL:</TableCell>
                            <TableCell className={`${tdClass} text-center`}>{totalPackages}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{totalWeight.toFixed(2)}</TableCell>
                            <TableCell className={`${tdClass} text-right`}>{formatValue(grandTotalAmount)}</TableCell>
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
                         <div className="flex justify-between text-xs py-0.5">
                            <span className="font-semibold">Total LR:</span>
                            <span className="font-bold">
                                {paidCount > 0 && `Paid(${paidCount}) `}
                                {toPayCount > 0 && `Topay(${toPayCount}) `}
                                {tbbCount > 0 && `TBB(${tbbCount}) `}
                                {focCount > 0 && `FOC(${focCount}) `}
                                Total {challan.totalLr}
                            </span>
                        </div>
                        <SummaryItem label="Total Packages:" value={totalPackages} />
                        <SummaryItem label="Total Items:" value={challan.totalItems} />
                        <SummaryItem label="Total Actual Wt:" value={`${totalWeight.toFixed(2)} kg`} />
                        <SummaryItem label="Total Freight:" value={formatValue(grandTotalAmount)} />
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
                        <SummaryItem label="Debit/Credit Note:" value={formatValue(challan.summary.debitCreditAmount)} />
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
